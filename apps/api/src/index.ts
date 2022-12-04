import './lib/env';
import app from './app';

const PORT = process.env.PORT || '4000';

app.listen(PORT, () => {
  console.log(`> ready on http://localhost:${PORT}`);
});
