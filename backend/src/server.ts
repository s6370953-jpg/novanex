import app from './app';
import { validateAuthConfiguration } from './middleware/auth.middleware';

const PORT = process.env.PORT || 5000;

validateAuthConfiguration();

app.listen(PORT, () => {
  console.log(`Learnova Tutor API server running on port ${PORT}`);
});
