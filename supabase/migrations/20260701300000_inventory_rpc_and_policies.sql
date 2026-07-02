-- 1. Create the RPC function for order placement and stock decrement (Atomic Transaction)
CREATE OR REPLACE FUNCTION public.submit_order_and_decrement_stock(
  p_name TEXT,
  p_centre TEXT,
  p_items JSONB,
  p_total_price NUMERIC
)
RETURNS UUID AS $$
DECLARE
  new_order_id UUID;
  item_rec RECORD;
  current_stock INT;
BEGIN
  -- Verify stock before placing order to avoid negative inventory
  FOR item_rec IN 
    SELECT (value->>'product_id')::UUID AS product_id, (value->>'quantity')::INT AS quantity
    FROM jsonb_array_elements(p_items)
  LOOP
    SELECT seller_quantity INTO current_stock 
    FROM public.products 
    WHERE id = item_rec.product_id;

    IF current_stock IS NULL THEN
      RAISE EXCEPTION 'Product % does not exist in catalog.', item_rec.product_id;
    END IF;

    IF current_stock < item_rec.quantity THEN
      RAISE EXCEPTION 'Insufficient stock. Only % units available for this item.', current_stock;
    END IF;
  END LOOP;

  -- Insert order record
  INSERT INTO public.orders (person_name, collection_centre, items, total_price)
  VALUES (p_name, p_centre, p_items, p_total_price)
  RETURNING id INTO new_order_id;

  -- Decrement stock and update status if sold out
  FOR item_rec IN 
    SELECT (value->>'product_id')::UUID AS product_id, (value->>'quantity')::INT AS quantity
    FROM jsonb_array_elements(p_items)
  LOOP
    UPDATE public.products
    SET 
      seller_quantity = seller_quantity - item_rec.quantity,
      status = CASE WHEN seller_quantity - item_rec.quantity <= 0 THEN 'sold' ELSE 'approved' END
    WHERE id = item_rec.product_id;
  END LOOP;

  RETURN new_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix Products Insert Policy for Admin
DROP POLICY IF EXISTS "Allow public to submit products" ON public.products;
DROP POLICY IF EXISTS "Allow admin to insert products" ON public.products;

CREATE POLICY "Allow public to submit products" 
ON public.products FOR INSERT TO public, anon WITH CHECK (status = 'pending');

CREATE POLICY "Allow admin to insert products" 
ON public.products FOR INSERT TO authenticated WITH CHECK (true);
