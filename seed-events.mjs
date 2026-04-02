import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jllzfxehjhtvvkaiasll.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbHpmeGVoamh0dnZrYWlhc2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTg1NzksImV4cCI6MjA4NzU5NDU3OX0.BIz1zed2iQ3211L2y1MaGR-PeM4vIZq7P7ssqCLwgKU'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const NEW_EVENTS = [
  // ── ON STAGE EVENTS ──
  {
    title: 'Classical Dance',
    category: 'Dance',
    description: 'Showcase the grace and tradition of classical Indian dance forms like Bharatanatyam, Kuchipudi, and Odissi. Performers will be judged on technique, expression, and costume.',
    event_date: '2026-08-15T09:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '💃',
  },
  {
    title: 'Classical Singing',
    category: 'Music',
    description: 'A melodious competition celebrating the classical ragas and talas of Indian music. Participants may perform Carnatic or Hindustani classical singing.',
    event_date: '2026-08-15T09:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '🎶',
  },
  {
    title: 'Duet Singing',
    category: 'Music',
    description: 'Two voices, one harmony. Pairs will showcase their vocal chemistry and coordination across any genre — from Bollywood to folk to devotional.',
    event_date: '2026-08-15T11:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '🎤',
  },
  {
    title: 'Solo Singing',
    category: 'Music',
    description: 'Step into the spotlight and let your voice shine! Solo singers from any genre are welcome. Be judged on sur, taal, and stage presence.',
    event_date: '2026-08-15T11:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '🎙️',
  },
  {
    title: 'Duet Dance',
    category: 'Dance',
    description: 'Two dancers, one unforgettable performance. Pairs can perform any dance style — classical, fusion, contemporary, or Bollywood. Judged on sync and expression.',
    event_date: '2026-08-15T13:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '🕺',
  },
  {
    title: 'Solo Dance',
    category: 'Dance',
    description: 'Own the stage alone! Solo dancers can perform any style — from classical to freestyle. Express your passion through movement and be judged on technique and energy.',
    event_date: '2026-08-15T13:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '💫',
  },
  {
    title: 'Group Dance',
    category: 'Dance',
    description: 'Teams of 5 or more light up the stage in a high-energy group dance competition. Choreography, synchronization, and theme will be the key judging criteria.',
    event_date: '2026-08-15T15:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '🎭',
  },
  {
    title: 'Fashion Show',
    category: 'Fashion',
    description: 'Walk the ramp and turn heads! Participants showcase their style, theme-based outfits, and confidence. Judged on costume creativity, walk, and overall presentation.',
    event_date: '2026-08-15T15:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '👗',
  },
  {
    title: 'Instrumental',
    category: 'Music',
    description: 'Let your instrument do the talking! Solo or ensemble performances on any instrument are welcome — violin, flute, tabla, guitar, keyboard, and more.',
    event_date: '2026-08-16T09:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '🎸',
  },
  {
    title: 'Battle of Bands',
    category: 'Music',
    description: 'Rock the campus! Bands compete head-to-head in an electrifying live music battle. Any genre is welcome — rock, metal, fusion, or indie. May the best band win!',
    event_date: '2026-08-16T11:00:00',
    venue: 'On Stage',
    capacity: 800,
    tickets_booked: 0,
    duration: '3 hours',
    emoji: '🎵',
  },
  {
    title: 'Stand-Up Comedy',
    category: 'Comedy',
    description: 'Make the crowd roar with laughter! Aspiring comedians take the mic for a set of original stand-up material. Judged on humor, timing, and crowd engagement.',
    event_date: '2026-08-16T13:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '😂',
  },
  {
    title: 'Mime',
    category: 'Arts',
    description: 'No words, just emotions. Mime artists convey powerful stories using only gestures and expressions. A deeply creative and thought-provoking event on the main stage.',
    event_date: '2026-08-16T13:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '1.5 hours',
    emoji: '🤫',
  },
  {
    title: 'Drama',
    category: 'Arts',
    description: 'Bring stories to life on stage! Teams perform original or adapted plays. Judged on script, acting, direction, costumes, and overall presentation.',
    event_date: '2026-08-16T15:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '3 hours',
    emoji: '🎬',
  },
  {
    title: 'Beat Boxing',
    category: 'Music',
    description: 'Control the beat with just your mouth! Beat boxers perform live vocal percussion — from classic hip-hop beats to experimental soundscapes. Show us what you\'ve got!',
    event_date: '2026-08-16T16:00:00',
    venue: 'On Stage',
    capacity: 500,
    tickets_booked: 0,
    duration: '1.5 hours',
    emoji: '🥁',
  },

  // ── OFF STAGE EVENTS ──
  {
    title: 'Painting',
    category: 'Art',
    description: 'Express yourself on canvas! Participants paint on a given theme using any medium — watercolour, acrylic, or oil. Judged on creativity, technique, and presentation.',
    event_date: '2026-08-15T10:00:00',
    venue: 'Off Stage',
    capacity: 200,
    tickets_booked: 0,
    duration: '3 hours',
    emoji: '🎨',
  },
  {
    title: 'Rangoli',
    category: 'Art',
    description: 'Celebrate colours and tradition! Participants create intricate rangoli designs on the floor using powder, flowers, or both. A beautiful fusion of art and culture.',
    event_date: '2026-08-15T10:00:00',
    venue: 'Off Stage',
    capacity: 150,
    tickets_booked: 0,
    duration: '2.5 hours',
    emoji: '🌸',
  },
  {
    title: 'Short Film',
    category: 'Art',
    description: 'Tell a story in minutes! Teams submit a short film (up to 10 minutes) on a given theme. Judged on screenplay, cinematography, editing, and direction.',
    event_date: '2026-08-15T11:00:00',
    venue: 'Off Stage',
    capacity: 100,
    tickets_booked: 0,
    duration: '3 hours',
    emoji: '🎥',
  },
  {
    title: 'Sketching',
    category: 'Art',
    description: 'Put pencil to paper and create magic! Participants sketch on a live theme using pencil, charcoal, or ink. Judged on realism, creativity, and detailing.',
    event_date: '2026-08-15T10:00:00',
    venue: 'Off Stage',
    capacity: 200,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '✏️',
  },
  {
    title: 'Dance Battle',
    category: 'Dance',
    description: 'Hit the floor and battle it out! 1v1 freestyle dance battles where dancers face off in front of the crowd. Any style — hip-hop, locking, popping, or breaking.',
    event_date: '2026-08-15T14:00:00',
    venue: 'Off Stage',
    capacity: 300,
    tickets_booked: 0,
    duration: '3 hours',
    emoji: '🔥',
  },
  {
    title: 'Photography',
    category: 'Art',
    description: 'Capture the moment! Participants roam the campus and submit their best shots on a given theme. Judged on composition, lighting, creativity, and storytelling.',
    event_date: '2026-08-15T09:00:00',
    venue: 'Off Stage',
    capacity: 100,
    tickets_booked: 0,
    duration: '4 hours',
    emoji: '📸',
  },
  {
    title: 'Mehendi',
    category: 'Art',
    description: 'A vibrant celebration of henna art! Participants design intricate mehendi patterns on a canvas provided. Judged on fineness, pattern density, and creativity.',
    event_date: '2026-08-15T10:00:00',
    venue: 'Off Stage',
    capacity: 100,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '🌿',
  },
  {
    title: 'Quiz',
    category: 'Literature',
    description: 'Test your general knowledge and quick thinking! Teams of 2 compete across rounds covering science, history, pop culture, sports, and current affairs.',
    event_date: '2026-08-16T10:00:00',
    venue: 'Off Stage',
    capacity: 200,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '🧠',
  },
  {
    title: 'Spoken Poetry',
    category: 'Literature',
    description: 'Your voice, your verses. Participants perform original or chosen poetry with emotion and rhythm. Judged on content, delivery, stage presence, and impact.',
    event_date: '2026-08-16T11:00:00',
    venue: 'Off Stage',
    capacity: 200,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '📝',
  },
  {
    title: 'Online Gaming [Free Fire]',
    category: 'Gaming',
    description: 'Gear up and survive! Teams of 4 battle it out in a thrilling Free Fire tournament. The last squad standing takes the crown. Register your squad and enter the zone!',
    event_date: '2026-08-16T10:00:00',
    venue: 'Off Stage',
    capacity: 200,
    tickets_booked: 0,
    duration: '4 hours',
    emoji: '🎮',
  },
  {
    title: 'MadAds',
    category: 'Art',
    description: 'Turn the absurd into advertising gold! Teams create and perform a hilarious advertisement for a ridiculous fictional product on the spot. Creativity and humor are key!',
    event_date: '2026-08-16T13:00:00',
    venue: 'Off Stage',
    capacity: 200,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '📢',
  },
  {
    title: 'Face Painting',
    category: 'Art',
    description: 'Transform a face into a canvas! Artists have 45 minutes to paint a model\'s face in any design or theme. Judged on creativity, technique, and the final result.',
    event_date: '2026-08-16T11:00:00',
    venue: 'Off Stage',
    capacity: 100,
    tickets_booked: 0,
    duration: '2 hours',
    emoji: '🎭',
  },
  {
    title: 'Parliament',
    category: 'Literature',
    description: 'Debate, deliberate, and decide! A mock parliament where participants take on roles as MPs and debate a given bill or motion. Judged on argumentation, decorum, and eloquence.',
    event_date: '2026-08-16T14:00:00',
    venue: 'Off Stage',
    capacity: 200,
    tickets_booked: 0,
    duration: '3 hours',
    emoji: '🏛️',
  },
  {
    title: 'Graffiti Art',
    category: 'Art',
    description: 'Paint the walls with your imagination! Participants create graffiti-style art on a designated canvas using spray cans and stencils. Judged on design, message, and technique.',
    event_date: '2026-08-15T09:00:00',
    venue: 'Off Stage',
    capacity: 100,
    tickets_booked: 0,
    duration: '3 hours',
    emoji: '🖌️',
  },
]

async function seedEvents() {
  console.log('🗑️  Deleting all existing events...')

  // First delete tickets to avoid foreign key constraint issues
  const { error: ticketErr } = await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (ticketErr) {
    console.warn('Warning deleting tickets:', ticketErr.message)
  } else {
    console.log('✅ Tickets cleared')
  }

  // Then delete all events
  const { error: eventErr } = await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (eventErr) {
    console.error('❌ Error deleting events:', eventErr.message)
    process.exit(1)
  }
  console.log('✅ All old events deleted')

  // Insert new events in batches of 10
  console.log(`\n📥 Inserting ${NEW_EVENTS.length} new events...`)
  const { data, error: insertErr } = await supabase.from('events').insert(NEW_EVENTS).select()
  if (insertErr) {
    console.error('❌ Error inserting events:', insertErr.message)
    process.exit(1)
  }

  console.log(`\n🎉 Successfully inserted ${data.length} events!`)
  data.forEach((e, i) => console.log(`  ${i + 1}. ${e.venue === 'On Stage' ? '🎭' : '🎨'} ${e.title} [${e.category}]`))
}

seedEvents()
