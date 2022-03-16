const User = require("./model/user");

const addGrade = async (ctx, text, dataUser) => {
  const arr = text.split(":");
  if (!arr[1]) {
    return setInvalid(
      ctx,
      "Invalid input, write  subject: grade across comma or space"
    );
  }

  if (arr[3]) {
    return setInvalid(
      ctx,
      "Invalid input, write  subject: grade across comma or space"
    );
  }

  const nameSubject = arr[0];
  const grade = arr[1].split(",")[1] ? arr[1].split(",") : arr[1].split(" ");

  if (!grade[1]) {
    return setInvalid(
      ctx,
      "Invalid input, write  subject: grade across comma or space"
    );
  }

  if (grade.some((i) => !isFinite(i))) {
    return setInvalid(ctx, "Invalid input, write grade  scores in numbers");
  }

  const user = await User.findOne({ firstName: dataUser.firstName });
  const newObj = user.subjects;

  if (newObj.hasOwnProperty(nameSubject)) {
    newObj[nameSubject] = [...newObj[nameSubject], ...grade];
  } else {
    newObj[nameSubject] = [...grade];
  }

  const updateUser = await User.findOneAndUpdate(
    { firstName: dataUser.firstName },
    { $set: { subjects: newObj } }
  );
  dataUser.state = "invalid";
  await ctx.reply("Good! Subject successfully added.");
};

const showAllMiddleScore = async (ctx, dataUser) => {
  const user = await User.findOne({ firstName: dataUser.firstName });
  await ctx.reply(`
   Your average scores in subjects.
 ${Object.keys(user.subjects).map((elem) => {
   return `${elem} : ${findScore(user.subjects[elem])}\n`;
 })}
    `);
};

const replyMessage = async (text, ctx) => {
  await ctx.reply(text);
};

const writeGradeAllSubject = async (ctx, text, dataUser) => {
  let isValid = true;
  const obj = {};
  const allSub = text.split(";");
  allSub.forEach((i) => {
    const newSubject = i.split(":");
    const subjectName = newSubject[0];
    if (!newSubject[1]) {
      isValid = false;
      return;
    }
    obj[subjectName] = newSubject[1].split(",")[1]
      ? newSubject[1].split(",")
      : newSubject[1].split(" ");

    if (obj[subjectName].some((i) => !isFinite(i))) {
      isValid = false;
      return;
    }
  });
  if (!isValid) {
    return setInvalid(
      ctx,
      "Invalid input, template: NAME_SUBJECT:GRADES->(across comme or space otherwise get error);->(IMPORTANCE! semicolon semicolon required at the end)."
    );
  }
  const res = await User.findOne({ firstName: dataUser.firstName });
  res.subjects = obj;
  dataUser.state = "invalid";
  res.save();
  ctx.reply('Changes saved')
};

const addSubject = async (ctx, name, dataUser) => {
  if (name.split(" ")[1]) {
    return ctx.reply(
      "Invalid input, write only name subject (if need space between words use hyphen )"
    );
  }
  const user = await User.findOne({ firstName: dataUser.firstName });
  const newObj = user.subjects;
  newObj[name] = [];
  const updateUser = await User.findOneAndUpdate(
    { firstName: dataUser.firstName },
    { $set: { subjects: newObj } }
  );
  dataUser.state = "invalid";
  await ctx.reply("Good! Subject successfully added.");
};

const findScore = (arr, isFinalGrade = false) => {
  const countGrade = arr.length;
  const averageScore =
    arr.reduce((prev, item) => +prev + +item, 0) / countGrade;
  if (isNaN(averageScore)) return 0;
  return isFinalGrade ? Math.round(averageScore) : averageScore.toFixed(2);
};

const showTotalScore = async (ctx, dataUser) => {
  const user = await User.findOne({ firstName: dataUser.firstName });

  const sum =
    Object.values(user.subjects).reduce(
      (prev, item) => prev + findScore(item, true),
      0
    ) / Object.keys(user.subjects).length;
  await ctx.reply(`Average score : ${sum.toFixed(1)}`);
};

const setInvalid = (ctx, text) => {
  return ctx.reply(text);
};

const initialUser = async (text, ctx, dataUser) => {
  console.log(text);
  if (!text) {
    return setInvalid(ctx, "Invalid input,repeat one more time.");
  }
  if (!text[1]) {
    return setInvalid(
      ctx,
      "Invalid input, write NAME LASTNAME (across space, nothing more to write)."
    );
  }
  if (text[2]) {
    return setInvalid(
      ctx,
      "Invalid input, write NAME LASTNAME (across space, nothing more to write)."
    );
  }
  dataUser.firstName = text[0];
  dataUser.lastName = text[1];

  const isExist = await User.findOne({ firstName: dataUser.firstName });

  if (isExist) {
    ctx.reply("User with this email address already exists,repeat one more");
    return;
  }

  const user = await User.create({
    firstName: text[0],
    lastName: text[1],
    subjects: {},
  });

  await user.save();
  dataUser.state = "invalid";
  await ctx.reply("Use command  /menu than to bring the menu or /help");
};

const login = async (ctx, name, dataUser) => {
  if (name.split(" ")[1]) {
    return setInvalid(ctx, "Invalid input, write only NAME");
  }
  const user = await User.findOne({ firstName: name });
  if (user) {
    await ctx.reply("Good! We know you.");
    dataUser.firstName = user.firstName;
    dataUser.lastName = user.lastName;
    await ctx.reply("Use command  /menu than to bring the menu or /help");
    dataUser.state = "invalid";
  } else {
    await ctx.reply("Bad.User not found.");
    await ctx.reply("Repeat one more time.");
  }
};

module.exports.login = login;
module.exports.initialUser = initialUser;
module.exports.writeGradeAllSubject = writeGradeAllSubject;
module.exports.addGrade = addGrade;
module.exports.addSubject = addSubject;
module.exports.replyMessage = replyMessage;
module.exports.showAllMiddleScore = showAllMiddleScore;
module.exports.showTotalScore = showTotalScore;
