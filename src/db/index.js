import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  totalScore: { type: Number, default: 0 }, 
  joinedAt: { type: Date, default: Date.now }
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // Problem statement
  sampleInput: { type: String, required: true },
  sampleOutput: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  testCases: [
      {
          input: { type: String, required: true },
          output: { type: String, required: true }
      }
  ],
  createdAt: { type: Date, default: Date.now }
});

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: { type: String, required: true }, // User's submitted code
  language: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Success', 'Failed'], default: 'Pending' },
  result: { type: String }, // Execution result or error
  score: { type: Number, default: 0 }, // Score generated for this submission
  submittedAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model('user', userSchema);
export const ProblemModel = mongoose.model('problem', problemSchema);
export const SubmissionModel = mongoose.model('submission', submissionSchema);
