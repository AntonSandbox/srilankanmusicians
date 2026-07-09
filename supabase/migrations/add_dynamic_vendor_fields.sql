-- Migration script to add dynamic fields to vendor and reviews tables

-- 1. Add years_of_experience to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 0;

-- 2. Add rating to vendor_reviews table
ALTER TABLE vendor_reviews ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5;
