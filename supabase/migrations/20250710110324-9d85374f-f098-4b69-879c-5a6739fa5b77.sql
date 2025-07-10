-- Create a table for notes without user authentication
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security but make it publicly accessible
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Notes are publicly viewable" 
ON public.notes 
FOR SELECT 
USING (true);

CREATE POLICY "Notes can be publicly created" 
ON public.notes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Notes can be publicly updated" 
ON public.notes 
FOR UPDATE 
USING (true);

CREATE POLICY "Notes can be publicly deleted" 
ON public.notes 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();