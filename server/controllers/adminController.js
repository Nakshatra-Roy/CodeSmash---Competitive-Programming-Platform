import User from '../models/userModel.js';
import Problem from '../models/problemModel.js';
import Submission from '../models/submissionModel.js';
import Contest from '../models/contestModel.js';
import asyncHandler from 'express-async-handler';

export const getStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const totalProblems = await Problem.countDocuments();
    const totalPendingProblems = await Problem.countDocuments({ status: 'Pending' });
    const totalApprovedProblems = await Problem.countDocuments({ status: 'Approved' });
    const totalRejectedProblems = await Problem.countDocuments({ status: 'Rejected' });

    const totalSubmissions = await Submission.countDocuments();
    const totalPendingSubmissions = await Submission.countDocuments({ verdict: 'Pending' });
    const totalAcceptedSubmissions = await Submission.countDocuments({ verdict: 'Accepted' });
    const totalWrongSubmissions = await Submission.countDocuments({ verdict: 'Wrong' });
    const totalRuntimeErrorSubmissions = await Submission.countDocuments({ verdict: 'Runtime Error' });
    const totalTimeLimitExceededSubmissions = await Submission.countDocuments({ verdict: 'Time Limit Exceeded' });

    const totalContests = await Contest.countDocuments();
    const totalPendingContests = await Contest.countDocuments({ status: 'Pending' });
    const totalRejectedContests = await Contest.countDocuments({ status: 'Rejected' });
    const totalUpcomingContests = await Contest.countDocuments({ status: 'Upcoming' });
    const totalOngoingContests = await Contest.countDocuments({ status: 'Ongoing' });
    const totalCompletedContests = await Contest.countDocuments({ status: 'Completed' });

    const stats = {
        users: {
            userTotal: totalUsers,
            adminTotal: totalAdmins,
        },
        problems: {
            total: totalProblems,
            pending: totalPendingProblems,
            approved: totalApprovedProblems,
            rejected: totalRejectedProblems
        },
        submissions: {
            total: totalSubmissions,
            pending: totalPendingSubmissions,
            accepted: totalAcceptedSubmissions,
            wrong: totalWrongSubmissions,
            runtime: totalRuntimeErrorSubmissions,
            timelimit: totalTimeLimitExceededSubmissions,
        },
        contests: {
            total: totalContests,
            pending: totalPendingContests,
            rejected: totalRejectedContests,
            upcoming: totalUpcomingContests,
            ongoing: totalOngoingContests,
            completed: totalCompletedContests,
        }
    };
    res.status(200).json(stats);
});

export const getAllAdmins = asyncHandler(async (req, res) => {
    const admins = await User.find({ role: 'admin' })
        .sort({ createdAt: -1 });
    res.status(200).json(admins);
});