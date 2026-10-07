import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Todo from '../models/Todo';

// Get user's todos
export const getTodos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todos = await Todo.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(todos.map(todo => ({ ...todo.toObject(), id: todo._id })));
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a todo
export const createTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, priority, type } = req.body;
    const todo = new Todo({
      userId: req.user.id,
      title,
      priority,
      type
    });
    const savedTodo = await todo.save();
    res.status(201).json({ ...savedTodo.toObject(), id: savedTodo._id });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a todo
export const updateTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isCompleted, title, priority } = req.body;
    
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: { isCompleted, title, priority } },
      { new: true }
    );
    
    if (!todo) {
      res.status(404).json({ message: 'Todo not found' });
      return;
    }
    
    res.json({ ...todo.toObject(), id: todo._id });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a todo
export const deleteTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user.id });
    
    if (!todo) {
      res.status(404).json({ message: 'Todo not found' });
      return;
    }
    
    res.json({ message: 'Todo removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
