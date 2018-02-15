const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CategorySchema = new mongoose.Schema({
  parent:  {
    type: ObjectId,
    ref: 'Category',
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  weight: {
    type: Number,
    default: 0,
    required: true
  },
  text: {
    type: String,
    required: false,
    trim: true
  },
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  created: {
    type: Date,
    required: false,
  },
  edited: {
     type: Date,
     required: false
  }
});

let CategorySchemaMap = (cats) => {
  let rows = [], row;
  for (let i =0; i < cats.length; i++) {
    row = {
      id: cats[i]._id,
      title: cats[i].title,
      weight: cats[i].weight,
      qSets: cats[i].qSets
    }
    rows.push(row);
  }
  return rows;
}

CategorySchema.statics.listAll = async function(id) {
  let cats = {};
  let QuestionSet = require('./questionSet');
  await Category.find({weight:0})
    .then(cs => cats = cs);
  let numCs = cats.length, cat;
  if (numCs > 0) {
    for (let i = 0; i < numCs; i++) {
      cat = cats[i];
      cat.qSets = [];
      await QuestionSet.loadMany({category:cat._id})
        .then(qss => {
          if (qss.length > 0) {
            for (let j = 0; j < qss.length; j++) {
              cat.qSets.push(QuestionSet.mapSet(qss[j]));   
            }
          }
          
        })
        .catch(e => {});
    }
  }
  return CategorySchemaMap(cats);
};

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;