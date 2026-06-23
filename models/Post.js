// models/Post.js
const mongoose = require('mongoose');

const PostCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String },
    parents_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PostCategory', default: null }
});

const PostSchema = new mongoose.Schema({
    tittle: { type: String, required: true }, // Giữ nguyên chính tả tittle từ ERD
    thumnail: { type: String },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    status: { type: String, default: 'draft' },
    image: { type: String },
    categories_post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PostCategory' }
}, { timestamps: true });

const PostCategory = mongoose.model('PostCategory', PostCategorySchema);
const Post = mongoose.model('Post', PostSchema);

module.exports = { PostCategory, Post };