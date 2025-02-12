export const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type, Accept',
};
