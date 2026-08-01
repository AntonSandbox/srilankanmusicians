-- 1. Create Recurring Slots Table
CREATE TABLE IF NOT EXISTS vendor_recurring_slots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sun, 1=Mon...
  start_time time NOT NULL,
  end_time time NOT NULL
);

-- 2. Create Date Overrides Table
CREATE TABLE IF NOT EXISTS vendor_date_overrides (
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  date date NOT NULL,
  PRIMARY KEY (vendor_id, date)
);

-- 3. Enable RLS
ALTER TABLE vendor_recurring_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_date_overrides ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
CREATE POLICY "Public read access for recurring slots" ON vendor_recurring_slots FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their own recurring slots" ON vendor_recurring_slots FOR ALL USING (auth.uid() = vendor_id);

CREATE POLICY "Public read access for date overrides" ON vendor_date_overrides FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their own date overrides" ON vendor_date_overrides FOR ALL USING (auth.uid() = vendor_id);

-- 5. Update the Search Function to handle Overrides, Recurring, and fix 23:59 bug
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
    
    -- 3. Availability Check (Overrides vs Recurring)
    AND (p_date IS NULL OR (
      (
        -- Case 1: Date is explicitly overridden
        EXISTS (SELECT 1 FROM vendor_date_overrides vdo WHERE vdo.vendor_id = v.id AND vdo.date = p_date)
        AND NOT EXISTS (
          SELECT 1 FROM vendor_unavailable_slots vus 
          WHERE vus.vendor_id = v.id 
            AND vus.date = p_date 
            AND vus.start_time = '00:00:00' 
            AND vus.end_time >= '23:59:00'
        )
      ) 
      OR 
      (
        -- Case 2: Date is NOT overridden, fallback to recurring schedule
        NOT EXISTS (SELECT 1 FROM vendor_date_overrides vdo WHERE vdo.vendor_id = v.id AND vdo.date = p_date)
        AND NOT EXISTS (
          SELECT 1 FROM vendor_recurring_slots vrs
          WHERE vrs.vendor_id = v.id 
            AND vrs.day_of_week = EXTRACT(DOW FROM p_date)
            AND vrs.start_time = '00:00:00' 
            AND vrs.end_time >= '23:59:00'
        )
      )
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
