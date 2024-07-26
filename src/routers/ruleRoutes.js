const express = require("express");
const ruleCtrl = require("../controllers/ruleCtrl");
const router = express.Router();
// console.log("helpp");
router.route("/rule/list")
.get(ruleCtrl.list)
.post(ruleCtrl.create)
router.route("/rule/verify/:ruleId")
.post(ruleCtrl.verifyUserData);
router.route("/rule/combine")
.post(ruleCtrl.combineRules);
router
  .route("/rule/:ruleId")
  .get(ruleCtrl.read)
  .put(ruleCtrl.update)
  .delete(ruleCtrl.remove);

router.param("ruleId",ruleCtrl.ruleById);

module.exports = router;
