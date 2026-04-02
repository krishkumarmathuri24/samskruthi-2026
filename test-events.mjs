import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://jllzfxehjhtvvkaiasll.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbHpmeGVoamh0dnZrYWlhc2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTg1NzksImV4cCI6MjA4NzU5NDU3OX0.BIz1zed2iQ3211L2y1MaGR-PeM4vIZq7P7ssqCLwgKU'
)

const { data, error, count } = await supabase
    .from('events')
    .select('id, title, venue', { count: 'exact' })
    .order('event_date', { ascending: true })
    .limit(100)

if (error) {
    console.error('ERROR:', error.message)
} else {
    console.log(`Total events returned: ${data.length}`)
    data.forEach((e, i) => console.log(`  ${i+1}. ${e.title} [${e.venue}]`))
}
