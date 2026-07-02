-- 1. Add UPDATE policy for orders table to allow admin editing
DROP POLICY IF EXISTS "Allow admin update access to orders" ON public.orders;

CREATE POLICY "Allow admin update access to orders" 
ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


-- 2. Create trigger to automatically delete corresponding orders when a product is deleted from catalog
CREATE OR REPLACE FUNCTION public.on_product_deleted_delete_orders()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any order where the items JSONB array contains the deleted product_id
  DELETE FROM public.orders
  WHERE id IN (
    SELECT o.id
    FROM public.orders o,
         jsonb_array_elements(o.items) item
    WHERE (item->>'product_id')::UUID = OLD.id
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists to prevent conflict
DROP TRIGGER IF EXISTS trigger_on_product_deleted ON public.products;

-- Create the trigger
CREATE TRIGGER trigger_on_product_deleted
AFTER DELETE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.on_product_deleted_delete_orders();
