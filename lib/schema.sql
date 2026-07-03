-- 1. Create the Vendor Category Enum
CREATE TYPE vendor_category AS ENUM ('Florist', 'DJ', 'Cake Designer');

-- 2. Create the vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category vendor_category NOT NULL,
  location TEXT,
  languages TEXT[] DEFAULT '{}',
  contact_email TEXT,
  schedule_url TEXT,
  profile_image TEXT,
  portfolio TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the vendor_blocked_dates table
CREATE TABLE vendor_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_blocked_dates ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for vendors table
-- Public Read
CREATE POLICY "Allow public read-only access on vendors" 
  ON vendors FOR SELECT 
  USING (true);

-- Update restricted to owner
CREATE POLICY "Allow individual update access on vendors" 
  ON vendors FOR UPDATE 
  USING (auth.uid() = id);

-- (Insert/Delete are implicitly blocked because no policies are created for them)

-- 6. RLS Policies for vendor_blocked_dates table
-- Public Read
CREATE POLICY "Allow public read-only access on blocked dates" 
  ON vendor_blocked_dates FOR SELECT 
  USING (true);

-- Owner specific actions (Insert, Update, Delete)
CREATE POLICY "Allow owner to insert blocked dates" 
  ON vendor_blocked_dates FOR INSERT 
  WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Allow owner to update blocked dates" 
  ON vendor_blocked_dates FOR UPDATE 
  USING (auth.uid() = vendor_id);

CREATE POLICY "Allow owner to delete blocked dates" 
  ON vendor_blocked_dates FOR DELETE 
  USING (auth.uid() = vendor_id);

-- 7. Create Indexes
-- B-Tree index for category
CREATE INDEX idx_vendors_category ON vendors USING BTREE (category);

-- B-Tree index for location
CREATE INDEX idx_vendors_location ON vendors USING BTREE (location);

-- GIN index for languages (array)
CREATE INDEX idx_vendors_languages ON vendors USING GIN (languages);

-- Composite index for blocked_date and vendor_id
CREATE INDEX idx_vendor_blocked_dates_composite ON vendor_blocked_dates (blocked_date, vendor_id);