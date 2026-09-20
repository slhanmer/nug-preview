import { defineDemo } from '@/seed/define'
import { richText } from '@/seed/lexical'

const BOOKINGS =
  'https://bookings.nowbookit.com/?accountid=8236eb6d-20b8-404f-9bf2-3173b106a232&venueid=13685&theme=light&colors=hex%2Ce0d4ac'
const MAPS =
  'https://www.google.com/maps/search/?api=1&query=694+Ann+St+Bakery+Lane+Fortitude+Valley+QLD+4006'
const INSTAGRAM = 'https://www.instagram.com/nug.generalstore/'

/*
 * NUG. General Store, 694 Ann St, Bakery Lane.
 *
 * Menu is theirs, prices included, transcribed from their own menu page.
 * Five spelling errors on that page are corrected here — "Eulsion",
 * "Agrolotti", "Kipfier", "$33.00g" and "Chili" — which is worth mentioning on
 * the call, gently, because it is the cheapest possible proof that somebody
 * read it properly.
 *
 * ⚠️ ONE PRICE IS OUT OF BAND AND THAT PAGE IS KNOWN TO BE UNRELIABLE.
 * "Truffled fior di latte arancio" is transcribed at $38 while every other
 * starter sits between $10 and $22 — off the same page that had "$33.00g" on
 * it. Left as transcribed, because prices get confirmed in the room and not
 * from here. Do not read that number out.
 *
 * ⚠️ EVERY HERO IS `layout: 'split'`, ON PURPOSE. Nothing in the asset set is
 * over 1164px on its longest edge and five of the eight are portrait or square
 * — they came off a grid. The default showcase hero crops to a wide band and
 * scales it to the full width of the screen, which on a 1440 laptop is a
 * 1.2–1.4x upscale of a photograph that was never big; the renderer's own
 * comment in src/skins/venue/sections/index.tsx describes exactly this fault.
 * At half width in a square frame the same files are used at or under native
 * and stay sharp. If you put a hero back to showcase, check the pixel
 * dimensions first.
 *
 * NOT CLAIMED ANYWHERE:
 *   - WHY they are closed Sun–Tue. An earlier draft said twice that the shut
 *     days are when the pasta gets made. Nobody told us that, and it reads as
 *     the owner explaining his own week — to the owner, who would know.
 *   - The colour or the size of the room. The painted windows are in their own
 *     photograph; "small", "yellow" and "it fills" were ours.
 *   - Daytime hours for the general store half. The bio carries dinner hours
 *     only, so the store gets a page and no times on it.
 *   - Anything the store stocks beyond what is visible in their own two
 *     photographs: no sourdough, no brioche, no dried pasta, no herbs.
 *   - Any claim about who their customers are or what they have seen.
 *   - Anything about the booking system beyond the link itself. The Now Book
 *     It URL is theirs, off their own bio, with its tracking parameters
 *     stripped.
 *   - Ratings, review counts, follower counts. Nobody read one.
 */
export default defineDemo({
  site: 'nug',

  images: {
    room: 'The dining room at night, full, with the painted windows behind',
    tortellini: 'Tortellini in brodo with fried morels, in a brown bowl on a green plate',
    trays: 'Rows of freshly made agnolotti dusted with semolina',
    table: 'A shared table — rigatoni, burrata, spritzes and wine',
    pizza: 'A pizza with wagyu bresaola, rocket and parmesan on a green plate',
    wine: 'Four Italian reds lined up against the wall',
    store: 'The shop window at dusk — fresh bread, croissants, produce and flowers',
    shelves: 'The general store shelves — preserves, oil, boards and ceramics',
  },

  menus: [
    {
      slug: 'dinner',
      title: 'Menu',
      standfirst:
        'Wednesday to Saturday, 5pm until 9:30pm. Built to be shared — order a few things between you and keep going.',
      footnote:
        'Bookings recommended; walk-ins are very limited. The menu moves with the season and with what the makers send us.',
      sections: [
        {
          heading: 'To start',
          items: [
            { name: 'Grilled bread', description: 'Confit garlic butter', price: '14' },
            {
              name: 'Fresh burrata',
              description: 'Grapes, roasted pine nuts and thyme',
              price: '18',
            },
            {
              name: 'Fried polenta, two for',
              description: 'Old Bay seasoning, mortadella and whipped ricotta',
              price: '10',
            },
            { name: 'Black Angus beef tartare', description: 'Homemade lavosh', price: '22' },
            { name: 'Truffled fior di latte arancio', price: '38' },
          ],
        },
        {
          heading: 'Handmade pasta',
          items: [
            { name: 'Rigatoni', description: 'Red wine braised pork ragù', price: '38' },
            {
              name: 'Ricotta ravioli',
              description: 'Ruby Creek wild mushroom emulsion. Vegetarian.',
              price: '37',
            },
            {
              name: 'Lobster agnolotti',
              description: 'Homemade lobster sauce and sundried bottarga',
              price: '40',
            },
          ],
        },
        {
          heading: 'Handmade pizza',
          items: [
            {
              name: 'Fennel and garlic salami',
              description: 'Smoked buffalo mozzarella and hot honey',
              price: '35',
            },
            { name: 'Salami cotto', description: 'Stracciatella and pistachio', price: '35' },
            {
              name: 'Kipfler potato',
              description: 'Sicilian and Jerusalem artichoke, rosemary. Vegetarian.',
              price: '34',
            },
            {
              name: 'LP’s pork and pecorino sausage',
              description: 'Saffron and chilli',
              price: '39',
            },
            { name: 'Broccoli and gorgonzola', price: '33' },
          ],
        },
        {
          heading: 'Dessert',
          items: [
            { name: 'Milk chocolate mousse', description: 'Burnt butter hazelnuts', price: '16' },
          ],
        },
      ],
    },
  ],

  pages: [
    {
      title: 'Home',
      slug: 'home',
      blocks: (ref) => [
        {
          blockType: 'hero',
          /*
           * The window, and only on this page. Their shopfront is the best
           * thing they own — painted glass, lettering on one pane and the room
           * visible through the next — so the site opens as one. The inner
           * pages stay `split`: a device used on every page is a layout, and a
           * layout is not a first impression.
           */
          layout: 'window',
          eyebrow: 'Bakery Lane, Fortitude Valley',
          heading: 'Handmade pasta, four nights a week',
          sub: 'Dinner Wednesday to Saturday, 5pm until 9:30pm. A general store the rest of the time.',
          image: ref.image('room'),
          primaryCta: { label: 'See the menu', href: '/menu' },
          secondaryCta: { label: 'Book a table', href: BOOKINGS },
        },

        {
          /* No heading. Three facts under a rule say what they are; a label
             over them was the only unstylish thing in the section, and it was
             naming the obvious. The titles carry the painted face instead. */
          blockType: 'featureGrid',
          layout: 'grid',
          items: [
            {
              title: 'Wed – Sat, 5pm – 9:30pm',
              body: 'Four nights a week for dinner. Closed Sunday through Tuesday.',
            },
            {
              title: 'Book ahead',
              body: 'Bookings are recommended and walk-ins are very limited, so calling first is the safe way in.',
            },
            {
              title: '694 Ann St, Bakery Lane',
              body: 'Off Ann Street in the Valley, through the lane. Look for the painted windows.',
            },
          ],
        },

        {
          blockType: 'mediaSplit',
          heading: 'Rolled, filled and cut here',
          body: richText(
            'Agnolotti, ravioli, rigatoni — made by hand, in house, for a four-night dinner service.',
            'The menu is built to be shared. Order a few things between you and keep ordering.',
          ),
          cta: { label: 'See the menu', href: '/menu' },
          image: ref.image('trays'),
          side: 'left',
        },

        {
          blockType: 'gallery',
          heading: 'From the pass',
          layout: 'grid',
          aspect: 'portrait',
          items: [
            { image: ref.image('tortellini'), caption: 'Tortellini in brodo, fried morels' },
            { image: ref.image('pizza'), caption: 'Wagyu bresaola, rocket, parmesan' },
            { image: ref.image('table'), caption: 'How it is meant to be eaten' },
            { image: ref.image('wine'), caption: 'Italian by the bottle' },
          ],
        },

        /*
         * The brief's whole angle: the retail half exists and is invisible.
         * Here it is, on the front page, with its own route behind it.
         */
        {
          blockType: 'mediaSplit',
          heading: 'And the rest of the week, a general store',
          body: richText(
            'Bread and pastry, produce and flowers out the front, and shelves of the things we cook with — oil, preserves, boards and bits for the kitchen.',
            'The other half of the room, and the half that is hardest to find.',
          ),
          cta: { label: 'What’s on the shelves', href: '/store' },
          image: ref.image('store'),
          side: 'right',
        },

        {
          blockType: 'cta',
          heading: 'Wednesday to Saturday',
          body: '5pm until 9:30pm. 694 Ann St, Bakery Lane. Booking is the safe way in.',
          primaryCta: { label: 'Book a table', href: BOOKINGS },
          secondaryCta: { label: 'Find us', href: MAPS },
        },

        {
          blockType: 'contact',
          heading: 'Ask us anything',
          body: 'Large tables, dietaries, a whole-room booking, or what’s on the shelves this week.',
        },
      ],
    },

    {
      title: 'Menu',
      slug: 'menu',
      blocks: (ref) => [
        {
          blockType: 'hero',
          layout: 'split',
          eyebrow: 'Wed – Sat, 5pm – 9:30pm',
          heading: 'The menu',
          sub: 'Made to be shared. Order a few things between you and keep going.',
          image: ref.image('tortellini'),
          primaryCta: { label: 'Book a table', href: BOOKINGS },
        },
        {
          blockType: 'menu',
          menu: ref.menu('dinner'),
          heading: 'Dinner',
          /*
           * OFF, and it is not a preference.
           *
           * The link goes to /menu/print, which redirects anyone without an
           * account to the Payload login. A customer who taps "Print this
           * list" on a restaurant's website and is asked to create an account
           * has found a broken site — and on a mock, they have found OURS. It
           * is a staff tool and it does not belong on a page a stranger reads.
           */
          showPrintLink: false,
        },
        {
          blockType: 'contact',
          heading: 'Dietaries and big tables',
          body: 'Tell us when you book and the kitchen will build around it rather than take things off.',
        },
      ],
    },

    {
      title: 'The store',
      slug: 'store',
      blocks: (ref) => [
        {
          blockType: 'hero',
          layout: 'split',
          eyebrow: 'Bakery Lane',
          heading: 'The general store',
          sub: 'Bread, produce, and the shelf of things we cook with.',
          image: ref.image('store'),
          primaryCta: { label: 'See what’s in this week', href: INSTAGRAM },
        },
        {
          blockType: 'featureGrid',
          heading: 'What’s usually here',
          intro: 'It changes. This is the shape of it.',
          layout: 'grid',
          items: [
            {
              title: 'Bread and pastry',
              body: 'Croissants, loaves, and whatever else came out that morning. It goes.',
            },
            {
              title: 'Produce and flowers',
              body: 'Out the front, in the baskets and the buckets — whatever is good rather than whatever is constant.',
            },
            {
              title: 'The shelf',
              body: 'Oil, preserves, boards, ceramics and the small things that make a kitchen work.',
            },
          ],
        },
        {
          blockType: 'gallery',
          layout: 'grid',
          aspect: 'portrait',
          items: [
            { image: ref.image('shelves'), caption: 'Inside' },
            { image: ref.image('store'), caption: 'The window, late afternoon' },
          ],
        },
        {
          blockType: 'contact',
          heading: 'Looking for something?',
          body: 'Ask and we’ll tell you whether it’s in, or when it will be.',
        },
      ],
    },
  ],
})
