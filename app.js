//Modules import
const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");


//setting app
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser: true ,useUnifiedTopology: true});

const itemSchema={
    name: String
};

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name: "Welcom to ToDoList"
});

const item2=new Item({
  name: "Hit + button add new items"
});

const item3=new Item({
  name: "<-- Check this to delete item"
});

const defaultItems=[item1,item2,item3];

// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Successfully save default items");
//   }
// });

const listSchema={
  name: String,
  items: [itemSchema]
};

const List=mongoose.model("List",listSchema);


//home
app.get("/",function(req,res){

  Item.find({},function(err,items){
    res.render('list',{listTitle: "Today", newListItem: items});
  });
});

// home/work

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name: customListName},function(err,result){
    if(!err){
      if(!result && customListName!=undefined){
        const list=new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render('list',{listTitle: result.name, newListItem: result.items});
      }
    }
  });
});

app.get("/about",function(req,res){
  res.render("about");
});

app.post("/",function(req,res){
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name: itemName
  });

    if(listName==="Today"){
      item.save();
      res.redirect("/");
    }
    else{
      List.findOne({name: listName},function(err,result){
        result.items.push(item);
        result.save();
        res.redirect("/"+listName);
      });
    }

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.deleteOne({_id: checkedItemId},function(err){
      if(err){
        console.log(err);
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,result){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

//port setting
app.listen(3000,function(){
  console.log("listening to port 3000");
});
