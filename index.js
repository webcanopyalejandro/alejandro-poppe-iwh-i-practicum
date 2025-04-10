require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const HUBSPOT_BASE = 'https://api.hubapi.com';
const HEADERS = {
  Authorization: `Bearer ${process.env.PRIVATE_APP_TOKEN}`,
  'Content-Type': 'application/json'
};
const OBJECT_TYPE_ID = process.env.OBJECT_TYPE_ID;

/* ---------- middleware ---------- */
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));

/* ---------- ROUTES ---------- */

// homepage: list records
app.get('/', async (req, res) => {
  try {
    const url = `${HUBSPOT_BASE}/crm/v3/objects/${OBJECT_TYPE_ID}?properties=name&type&properties=notes&limit=100`;
    const { data } = await axios.get(url, { headers: HEADERS });

    const rows = data.results.map(r => ({
      name: r.properties.name,
      type: r.properties.type,
      notes: r.properties.notes
    }));
    res.render('homepage', { title: 'Custom Object Table', rows });
  } catch (err) {
    console.error(err.response?.data || err.message);
   res.status(500).send(`Error loading records: ${JSON.stringify(err.response?.data || err.message)}`);

  }
});

// render form
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
  });
});

// create record
app.post('/update-cobj', async (req, res) => {
  const { name, type, notes } = req.body;
  try {
    const url = `${HUBSPOT_BASE}/crm/v3/objects/${OBJECT_TYPE_ID}`;
    await axios.post(
      url,
      { properties: { name, type, notes } },
      { headers: HEADERS }
    );
    res.redirect('/');
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Error creating record.');
  }
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
