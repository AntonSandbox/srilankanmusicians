-- Migration script to add dynamic fields to vendor and reviews tables

-- 1. Add years_of_experience to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;

