const express = require('express');
const Post = require('../models/post');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/posts', auth, async (req, res) => {
  const post = new Post({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await post.save();
    res.status(201).send(post);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/posts', auth, async (req, res) => {
  try {
    await req.user.populate('posts').execPopulate();
    res.send(req.user.posts);
  } catch (e) {
    res.status(500).send();
  }
});
router.get('/public/posts', async (req, res) => {
  try {
    const posts = await Post.find({});
    res.send(posts);
  } catch (e) {
    res.status(500).send();
  }
});
router.get('/newsfeed', auth, async (req, res) => {
  try {
    const posts = await Post.find({});
    res.send(posts);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/posts/:id', auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const post = await Post.findOne({ _id, owner: req.user._id });

    if (!post) {
      return res.status(404).send();
    }

    res.send(post);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/posts/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['content', 'likes'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const post = await Post.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!post) {
      return res.status(404).send();
    }

    updates.forEach((update) => (post[update] = req.body[update]));
    await post.save();
    res.send(post);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await post.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!post) {
      res.status(404).send();
    }

    res.send(post);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
