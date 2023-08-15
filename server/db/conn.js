const mongoose=require('mongoose');

//connect to Database
const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection Succcesful");
  })
  .catch((err) => {
    console.log("Connection Unsuccesful", err);
  });
//end
