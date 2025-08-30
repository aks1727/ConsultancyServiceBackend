import express from 'express';
import errorHandler from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// ✅ Enable CORS BEFORE routes
app.use(cors({
  origin: [
    "https://consultancy-service-platform.vercel.app", // no trailing slash
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// ✅ Routes
app.get('/', (req, res) => {
  res.send("Hii there welcome in my backend");
});

import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import searchRouter from "./routes/search.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";

app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/searches', searchRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/message', messageRouter);

// ✅ Error handler (keep last)
app.use(errorHandler);

export default app;
