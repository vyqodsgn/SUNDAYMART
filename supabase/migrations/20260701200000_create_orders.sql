-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_name TEXT NOT NULL,
    collection_centre TEXT NOT NULL, -- 'Main Church' or 'Mission Centre'
    items JSONB NOT NULL, -- list of items: [{"product_id": "...", "name": "...", "price": 100, "quantity_option": "500 gm", "quantity": 2}]
    total_price NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public to insert orders
CREATE POLICY "Allow public to insert orders" 
ON public.orders FOR INSERT TO public, anon, authenticated WITH CHECK (true);

-- Allow admin to select and delete orders
CREATE POLICY "Allow admin read access to orders" 
ON public.orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin delete access to orders" 
ON public.orders FOR DELETE TO authenticated USING (true);
