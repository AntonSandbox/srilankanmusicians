-- 1. Create Vendor Unavailable Slots Table
CREATE TABLE IF NOT EXISTS vendor_unavailable_slots (
    id BIGSERIAL PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_vendor_unavailable_slots_vendor_id ON vendor_unavailable_slots(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_unavailable_slots_date ON vendor_unavailable_slots(date);

-- 3. Enable RLS and setup policies
ALTER TABLE vendor_unavailable_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for unavailable slots" ON vendor_unavailable_slots FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their own unavailable slots" ON vendor_unavailable_slots FOR ALL USING (auth.uid() = vendor_id);

-- 4. Update the Search Function
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
    AND (p_occasion IS NULL OR p_occasion = ANY(v.occasions))
    AND (p_languages IS NULL OR v.languages @> p_languages)
    
    -- 3. Date Slots Availability Check
    -- Vendors are available all day by default. We just ensure they don't have a 00:00 to 23:59 unavailable slot for the date.
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
