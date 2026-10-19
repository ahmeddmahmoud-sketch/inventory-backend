ALTER TABLE "inventory"
ADD CONSTRAINT "inventory_quantity_nonnegative"
CHECK ("quantity" >= 0);

ALTER TABLE "stock_movements"
ADD CONSTRAINT "stock_movement_quantity_valid"
CHECK (
    ("type" = 'RECEIVE' AND "quantity" > 0)
    OR
    ("type" = 'ISSUE' AND "quantity" < 0)
    OR
    ("type" = 'ADJUST' AND "quantity" <> 0)
);