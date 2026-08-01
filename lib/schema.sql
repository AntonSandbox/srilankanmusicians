-- ==========================================
-- 1. CORE TABLES
-- ==========================================

-- Vendors Table
CREATE TABLE vendors (
    id UUID PRIMARY KEY, -- Links directly to auth.users.id
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    languages TEXT[] NOT NULL DEFAULT '{}',
    occasions TEXT[] NOT NULL DEFAULT '{}',
    budget_range TEXT,
    contact_email TEXT NOT NULL,
    schedule_url TEXT,
    profile_image TEXT,
    portfolio TEXT[] DEFAULT '{}',
    bio TEXT DEFAULT 'Passionate professional ready to make your event unforgettable.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- Vendor Availability Slots (Old logic - kept for backward compatibility)
CREATE TABLE vendor_availability_slots (
    id BIGSERIAL PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    slot_morning BOOLEAN NOT NULL DEFAULT false,
    slot_afternoon BOOLEAN NOT NULL DEFAULT false
);

-- Vendor Unavailable Slots (New custom time slot based unavailability)
CREATE TABLE vendor_unavailable_slots (
    id BIGSERIAL PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- Vendor Reviews Table
CREATE TABLE vendor_reviews (
    id BIGSERIAL PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL,
    review_text TEXT NOT NULL,
    review_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 2. PERFORMANCE INDEXES
-- ==========================================

-- B-Tree index for exact string matching on heavily filtered columns
CREATE INDEX idx_vendors_category_location ON vendors (category, location);

-- GIN indexes for lightning-fast array searching
CREATE INDEX idx_vendors_languages ON vendors USING gin (languages);
CREATE INDEX idx_vendors_occasions ON vendors USING gin (occasions);



-- Indexes for fast date slot checking
CREATE INDEX idx_vendor_slots_vendor_id ON vendor_availability_slots(vendor_id);
CREATE INDEX idx_vendor_slots_date ON vendor_availability_slots(date);

-- Indexes for fast unavailable slots checking
CREATE INDEX idx_vendor_unavailable_slots_vendor_id ON vendor_unavailable_slots(vendor_id);
CREATE INDEX idx_vendor_unavailable_slots_date ON vendor_unavailable_slots(date);

-- Index for fast review fetching when opening a profile
CREATE INDEX idx_vendor_reviews_vendor_id ON vendor_reviews (vendor_id);


-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_available_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

-- Vendors Table Policies
-- Public can read all vendors. Only the owner can update their profile. (Creation is handled by Admin Service Role).
CREATE POLICY "Public read access for vendors" ON vendors FOR SELECT USING (true);
CREATE POLICY "Vendors can update their own profile" ON vendors FOR UPDATE USING (auth.uid() = id);



ALTER TABLE vendor_availability_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for slots" ON vendor_availability_slots FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their own slots" ON vendor_availability_slots FOR ALL USING (auth.uid() = vendor_id);

ALTER TABLE vendor_unavailable_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for unavailable slots" ON vendor_unavailable_slots FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their own unavailable slots" ON vendor_unavailable_slots FOR ALL USING (auth.uid() = vendor_id);

-- Reviews Policies
-- Public can read to view on the dialog popup. Vendors can manage their own reviews.
CREATE POLICY "Public read access for reviews" ON vendor_reviews FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their own reviews" ON vendor_reviews FOR ALL USING (auth.uid() = vendor_id);


-- ==========================================
-- 4. SEARCH RPC FUNCTION (STORED PROCEDURE)
-- ==========================================

CREATE OR REPLACE FUNCTION search_available_vendors(
  p_category text DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_languages text[] DEFAULT NULL,
  p_date date DEFAULT NULL,
  p_occasion text DEFAULT NULL,
  p_budget text DEFAULT NULL
)
RETURNS SETOF vendors AS $$
BEGIN
  RETURN QUERY
  SELECT v.*
  FROM vendors v
  WHERE 
    -- 1. Exact Match Filters
    (p_category IS NULL OR v.category = p_category)
    AND (p_location IS NULL OR v.location = p_location)
    AND (p_budget IS NULL OR v.budget_range = p_budget)
    
    -- 2. Array Match Filters
    -- Occasion: Check if the provided occasion string exists anywhere inside the vendor's occasions array
    AND (p_occasion IS NULL OR p_occasion = ANY(v.occasions))
    -- Languages: Uses the @> containment operator to ensure the vendor speaks ALL the requested languages
    AND (p_languages IS NULL OR v.languages @> p_languages)
    
    -- 3. Date Slots Availability Check
    -- Ensures they don't have an unavailable slot that covers the entire day (00:00 to 23:59)
    -- If they have specific slots, they are still considered available for that date in search results,
    -- users will just have to pick a non-overlapping time slot.
    AND (p_date IS NULL OR NOT EXISTS (
      SELECT 1
      FROM vendor_unavailable_slots vus
      WHERE vus.vendor_id = v.id
        AND vus.date = p_date
        AND vus.start_time = '00:00:00'
        AND vus.end_time >= '23:59:00'
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;