-- 1. Create the new Vendor Availability Slots Table
CREATE TABLE IF NOT EXISTS vendor_availability_slots (
    id BIGSERIAL PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    slot_morning BOOLEAN NOT NULL DEFAULT false,
    slot_afternoon BOOLEAN NOT NULL DEFAULT false
);

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_vendor_availability_slots_vendor_id ON vendor_availability_slots(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_slots_date ON vendor_availability_slots(date);

-- 3. Enable RLS and setup policies
ALTER TABLE vendor_availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for slots" ON vendor_availability_slots FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their own slots" ON vendor_availability_slots FOR ALL USING (auth.uid() = vendor_id);

-- 4. Migrate existing vendors to a dummy date (July 15, 2026 - Morning Slot)
INSERT INTO vendor_availability_slots (vendor_id, date, slot_morning, slot_afternoon)
SELECT id, '2026-07-15', true, false FROM vendors;

-- 5. Drop the old table and its dependencies
DROP TABLE IF EXISTS vendor_available_ranges CASCADE;

-- 6. Update the Search Function to strictly use the new table
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
    -- Ensures there is a row in the vendor_availability_slots table for that exact date with at least one slot open.
    AND (p_date IS NULL OR EXISTS (
      SELECT 1
      FROM vendor_availability_slots vas
      WHERE vas.vendor_id = v.id
        AND vas.date = p_date
        AND (vas.slot_morning = true OR vas.slot_afternoon = true)
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
