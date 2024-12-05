const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// タスク一覧の取得
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId })
      .populate('tags')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// タスクの作成
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      user: req.userId
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: '無効なリクエストです' });
  }
});

// タスクの更新
router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'タスクが見つかりません' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: '無効なリクエストです' });
  }
});

// タスクの削除
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    if (!task) return res.status(404).json({ message: 'タスクが見つかりません' });
    res.json({ message: 'タスクを削除しました' });
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;