import User from '../models/userModel.js';
import Submission from '../models/submissionModel.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
}

export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.params.userId;
    const submission = await Submission.find({ "user.ID": userId }).sort({ createdAt: -1 });
    res.status(200).json({ submission });
  } catch (error) {
    console.error("Error in getUserTasks:", error);
    res.status(500).json({ message: 'Error fetching user tasks', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  let { flag, accountStatus, role } = req.body;


  try {
    if (typeof flag === "string") {
      flag = flag.toLowerCase() === "true";
    }

    const updateData = {};
    const messages = [];

    let emitFlagEvent = false;
    let emitStatusEvent = false;
    let emitRoleEvent = false;

    if (flag === true || flag === false) {
      updateData.flag = flag;
      messages.push(flag ? "User has been flagged." : "User flag has been removed.");
      emitFlagEvent = true;
    }

    if (typeof accountStatus === "string" && accountStatus.trim() !== "") {
      updateData.accountStatus = accountStatus;
      messages.push(`Account status set to "${accountStatus}".`);
      emitStatusEvent = true;
    }

    if (typeof role === "string" && role.trim() !== "") {
      updateData.role = role;
      messages.push(`User role updated to "${role}".`);
      emitRoleEvent = true;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (req.io) {
      if (emitFlagEvent) {
        // console.log("📡 EMITTING userFlagged to room:", id.toString());
        req.io.to(id.toString()).emit("userFlagged", {
          message: flag
            ? "❌ Your account has been flagged by an administrator. Some functionalities have been blocked."
            : "Your account has been unflagged. All functionalities restored ✅",
          flag
        });
      }

      if (emitStatusEvent) {
        req.io.to(id.toString()).emit("accountStatusChanged", {
          message: `⚠️ Your account status is now "${accountStatus}".`,
          accountStatus
        });
      }

      if (emitRoleEvent) {
        req.io.to(id.toString()).emit("roleChanged", {
          message: `Your role has been updated to "${role}".`,
          role
        });
      }
    }

    res.status(200).json({
      message: messages.length > 0 ? messages.join(" ") : "No changes applied.",
      updatedUser
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
