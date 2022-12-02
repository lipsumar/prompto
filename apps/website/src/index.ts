import express from 'express';

const app = express();

const PORT = process.env.PORT || '3000';

app.get('/', (req, res) => {
  res.send('Prompto!');
});

app.listen(PORT, () => {
  console.log(`> ready on http://localhost:${PORT}`);
});
