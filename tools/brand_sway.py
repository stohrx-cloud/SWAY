# Turn the Rivage page into a SWAY Oakville concept: SWAY's own type (Cinzel + Lora), colours, words,
# address, hours and three locations. Run once on a fresh copy of SAMPLES/RIVAGE.
import os, re
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
s = open('index.html', encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    c = s.count(a); assert c == n, (a[:70], c); s = s.replace(a, b)

IG = 'https://www.instagram.com/swayoakville/'
MAP = 'https://maps.google.com/?q=SWAY+Oakville+170+Lakeshore+Road+East+Oakville'
MAIL = 'shop@swayoakville.example'

# ---- head
rep('<title>Rivage, sundresses and sunny little things in Port Credit</title>', '<title>SWAY Oakville, European style for coastal days and lakeside living</title>')
rep('content="Rivage is a little boutique on the harbour in Port Credit: sundresses, stripes, straw bags and sunny little things for days by the water. Shop online, or pick up on the harbour."',
    'content="SWAY Oakville: European-inspired fashion and design for coastal days and lakeside living, on Lakeshore Road East in Oakville, and in Muskoka and Niagara-on-the-Lake."')
s = re.sub(r'<link rel="icon" href="[^"]*">', '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 64 64\'%3E%3Crect width=\'64\' height=\'64\' rx=\'32\' fill=\'%23251002\'/%3E%3Ctext x=\'32\' y=\'43\' font-family=\'Cinzel,Georgia,serif\' font-size=\'32\' text-anchor=\'middle\' fill=\'%23efedeb\'%3ES%3C/text%3E%3C/svg%3E">', s, count=1)
s = re.sub(r'<link href="https://fonts.googleapis.com/css2\?family=Fraunces[^"]*" rel="stylesheet">',
           '<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">', s, count=1)

# ---- comment, palette and type: SWAY's own
a = s.index('/* ====='); b = s.index('*/', a) + 2
s = s[:a] + '''/* =====================================================================================================
   SWAY OAKVILLE, concept by STOHRX. Built on the Rivage sample (taste skill "uneven photographs", scroll-craft
   grammar "One day", GSAP, WebGL) and re-branded with SWAY's own identity from swayoakville.com: Cinzel
   capitals for the name and headings, Lora for reading, warm grey #efedeb, deep brown #251002, olive grey
   #807f71, dark brown pill buttons. White grounds keep the colour in the photographs. All photographs are
   Pexels placeholders, to be replaced with SWAY's own.
   ===================================================================================================== */''' + s[b:]
rep("--ink:#262a44; --muted:#545a74; --ink-l:#fbf6ee; --muted-l:#d6d8ec;", "--ink:#251002; --muted:#5f5a4e; --ink-l:#f6f3ef; --muted-l:#d9d2c8; --olive:#807f71;")
rep("--pink:#ff9cb6; --pink-2:#ff86a6; --pink-ink:#262a44;", "--pink:#251002; --pink-2:#43271a; --pink-ink:#ffffff;")
rep("--tint:#fff3f6;", "--tint:#efedeb;")
rep("--dusk:#efe9ff; --night:#24274d;", "--dusk:#efedeb; --night:#251002;")
rep("--display:'Fraunces', Georgia, serif; --text:'Figtree', system-ui, sans-serif;", "--display:'Cinzel', Georgia, serif; --text:'Lora', Georgia, serif;")
rep("h1,h2,h3{margin:0;font-family:var(--display);font-weight:400;font-variation-settings:\"SOFT\" 100,\"WONK\" 1;letter-spacing:-0.02em;line-height:1.02}",
    "h1,h2,h3{margin:0;font-family:var(--display);font-weight:400;letter-spacing:0.01em;line-height:1.08}\nh2{color:var(--olive)}")
rep("h1 em,h2 em,.say em{font-style:italic;font-weight:400}", "h1 em,h2 em{font-style:normal}\n.say em{font-style:italic;font-weight:400}")
rep(".btn b{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 7px;border-radius:12px;background:var(--white);",
    ".btn b{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 7px;border-radius:12px;background:var(--white);color:var(--ink);")
rep(".word{font-family:var(--display);font-variation-settings:\"SOFT\" 100,\"WONK\" 1;font-size:var(--step-lead);font-weight:500;text-decoration:none}",
    ".word{font-family:var(--display);font-size:var(--step-lead);font-weight:500;letter-spacing:0.16em;text-decoration:none}")
s = s.replace('font-variation-settings:"SOFT" 100,"WONK" 1;', '')
rep(".card .note{font-size:var(--step-small);font-weight:600;color:#b8355f}", ".card .note{font-size:var(--step-small);font-weight:600;color:#8a4b2a}")
rep(".hcopy h1{font-size:clamp(2rem,1rem + 2.2vw,3rem);line-height:1;max-width:10ch}", ".hcopy h1{font-size:clamp(1.9rem,1rem + 1.9vw,2.75rem);line-height:1.08;max-width:11ch}")
rep(".card h3{font-size:var(--step-lead);line-height:1.15;letter-spacing:-0.01em}", ".card h3{font-family:var(--text);font-weight:500;font-size:var(--step-lead);line-height:1.2;letter-spacing:0}")
rep(".visit .reach h2{font-family:var(--text);", ".visit .reach h2{color:var(--ink-l);font-family:var(--text);")

# ---- words
rep('<a class="word" href="#top">Rivage</a>', '<a class="word" href="#top">SWAY</a>', 2)
rep('<h1 id="h1">Dressed for the <em>harbour.</em></h1>', '<h1 id="h1">Coastal days, lakeside living.</h1>')
rep('<p>Sundresses, stripes and sunny little things, from a tiny shop on the harbour in Port Credit.</p>',
    '<p>European-inspired fashion and design, from our shops in Oakville, Muskoka and Niagara-on-the-Lake.</p>')
rep('alt="Pastel houses climbing a green hill above a harbour full of white boats"', 'alt="Pastel houses climbing a green hill above a little port full of white boats"')
rep('<p class="cap">Somewhere with boats and gelato.</p>', '<p class="cap">The European summer, brought home to Lakeshore.</p>')
rep('<p class="intro" data-sc-in>Everything is on the rail in Port Credit today. Free shipping over $150, or pick up on the harbour the same day.</p>',
    '<p class="intro" data-sc-in>Everything is on the rail at 170 Lakeshore Road East today. Free shipping over $150, or pick up in Oakville the same day.</p>')
rep('<p class="meta">Washed linen, made in Lithuania</p>', '<p class="meta">Washed European linen</p>')
rep('<noscript><p>To order, call the shop at 905-555-0188 or email hello@rivage.example.</p></noscript>',
    '<noscript><p>To order, visit us at 170 Lakeshore Road East or message us on Instagram, @swayoakville.</p></noscript>')
rep('<p id="sunset">Golden hour on the harbour starts about an hour before sunset. Bring a silk scarf.</p>', '<p id="sunset">Golden hour on the lake starts about an hour before sunset. Bring a silk scarf.</p>')
rep('<h2 class="vh" id="askTitle">Pick up on the harbour</h2>', '<h2 class="vh" id="askTitle">Pick up in Oakville</h2>')
rep('Order by four and pick it up on the harbour the same evening, wrapped in <em>pink tissue.</em>', 'Order by four and pick it up on Lakeshore the same evening, wrapped in <em>tissue.</em>')
rep('<a class="link" href="tel:+19055550188">Or call the shop</a>', f'<a class="link" href="{IG}">Or message us on Instagram</a>')
rep('<p class="say" data-sc-in>Open Tuesday to Sunday on the harbour, and late on <em>Fridays.</em></p>',
    '<p class="say" data-sc-in>Open every day on Lakeshore Road East, a block from the <em>lake.</em></p>')
rep('<h2 id="visitTitle">Coming by?</h2>', '<h2 id="visitTitle">Three shops</h2>')
rep(f'<a href="mailto:hello@rivage.example">hello@rivage.example</a>\n      <a href="https://maps.google.com/?q=Port+Credit+harbour+Mississauga">Directions to the harbour</a>\n      <p>Port Credit, Mississauga. We reply the same day.</p>',
    f'<a href="{MAP}">170 Lakeshore Road East, Oakville</a>\n      <a href="{IG}">@swayoakville on Instagram</a>\n      <p>Monday to Saturday 10 to 6, Sunday 11 to 5. Also in Muskoka and Niagara-on-the-Lake.</p>')
rep('<h2 class="vh" id="footTitle">Rivage, the menu</h2>', '<h2 class="vh" id="footTitle">SWAY Oakville, the menu</h2>')
rep('<div><h3>The shop</h3><p>On the harbour, Port Credit<br>Tuesday to Sunday, 10 to 6<br>Fridays until 8</p></div>',
    '<div><h3>Oakville</h3><p>170 Lakeshore Road East<br>Monday to Saturday, 10 to 6<br>Sunday, 11 to 5</p></div>')
rep(f'<div><h3>Talk to us</h3><p><a href="mailto:hello@rivage.example">hello@rivage.example</a><br><a href="tel:+19055550188">905-555-0188</a></p></div>',
    f'<div><h3>Also in</h3><p>Muskoka<br>Niagara-on-the-Lake<br><a href="{IG}">@swayoakville</a></p></div>')
rep('Sample concept shop: names, prices, stock, hours and the address are placeholders, and checkout sends an email instead of charging.',
    'A concept website designed by STOHRX as a proposal for SWAY Oakville. It is not an official SWAY website: products, prices, stock and the shop email are placeholders, the photographs are Pexels stand-ins for SWAY\'s own, and checkout sends an email instead of charging.')
rep('<input type="radio" name="how" value="pickup"> Pick up on the harbour', '<input type="radio" name="how" value="pickup"> Pick up in Oakville')
rep('This is a sample shop: checking out emails your order to the shop, and nothing is charged.', 'This is a concept: checking out emails your order to the shop, and nothing is charged.')
rep('<a class="btn" id="checkout" href="mailto:hello@rivage.example">Check out</a>', f'<a class="btn" id="checkout" href="mailto:{MAIL}">Check out</a>')
rep('<script src="rivage.js"></script>', '<script src="sway.js"></script>')
rep('<a class="skip" href="#shop">Skip to the shop</a>', '<a class="skip" href="#shop">Skip to the shop</a>')
assert s.count('Rivage') == 1 and 'Port Credit' not in s and 'rivage' not in s, 'leftover'
open('index.html', 'w', encoding='utf-8').write(s)

j = open('sway.js', encoding='utf-8').read()
def jr(a, b):
    global j
    assert j.count(a) == 1, a[:60]; j = j.replace(a, b)
jr("/* Rivage v2: one day at the lake, with a little shop.", "/* SWAY Oakville concept: one day at the lake, with the shop.")
j = j.replace("'rivage-bag'", "'sway-bag'")
jr("'Pick-up on the harbour is always free.'", "'Pick-up in Oakville is always free.'")
jr("'Hello Rivage,\\n\\nI would like to order:\\n'", "'Hello SWAY,\\n\\nI would like to order:\\n'")
jr("'\\nI will pick up on the harbour.'", "'\\nI will pick up in Oakville.'")
jr("'mailto:hello@rivage.example?subject='", f"'mailto:{MAIL}?subject='")
jr("today's sun over Port Credit (NOAA)", "today's sun over Oakville (NOAA)")
jr("var LAT = 43.551, LON = -79.586,", "var LAT = 43.447, LON = -79.666,")
jr("'Today the sun sets over Port Credit at '", "'Today the sun sets over Oakville at '")
jr("cols = ['#ff9cb6', '#f1b14a', '#a9c7e0', '#ff86a6']", "cols = ['#807f71', '#f7b955', '#a9cbe8', '#c9a68a']")
assert 'Rivage' not in j and 'rivage' not in j and 'Port Credit' not in j
open('sway.js', 'w', encoding='utf-8').write(j)
print('branded')
