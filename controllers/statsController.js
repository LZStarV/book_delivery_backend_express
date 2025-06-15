const userDB = require('../databases/userDB');
const fileDB = require('../databases/fileDB');
const auditDB = require('../databases/auditDB');
const categoryDB = require('../databases/categoryDB');
const { protect, authorize } = require('../middleware/auth');

/**
 * @desc    获取系统总览统计
 * @route   GET /api/v1/stats/overview
 * @access  私有/管理员
 */
exports.getSystemOverview = async (req, res) => {
    try {
        const [
            totalUsers,
            totalFiles,
            totalCategories,
            totalTags,
            todayUploads,
            todayUsers
        ] = await Promise.all([
            userDB.getUserCount(),
            fileDB.getFileCount(),
            categoryDB.getCategoryCount(),
            fileDB.getTagCount(), // 修正为fileDB（假设统计文件标签）
            fileDB.getTodayUploadCount(),
            userDB.getTodayRegisterCount()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalFiles,
                totalCategories,
                totalTags,
                todayUploads,
                todayUsers
            }
        });
    } catch (error) {
        console.error('获取系统总览统计错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取今日统计数据
 * @route   GET /api/v1/stats/today
 * @access  私有/管理员
 */
exports.getTodayStatistics = async (req, res) => {
    try {
        const [
            todayUploads,
            todayUsers,
            todayAudits,
            todayDownloads
        ] = await Promise.all([
            fileDB.getTodayUploadCount(),
            userDB.getTodayRegisterCount(),
            auditDB.getTodayAuditCount(),
            fileDB.getTodayDownloadCount()
        ]);

        res.status(200).json({
            success: true,
            data: {
                todayUploads,
                todayUsers,
                todayAudits,
                todayDownloads
            }
        });
    } catch (error) {
        console.error('获取今日统计数据错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取本周统计数据
 * @route   GET /api/v1/stats/week
 * @access  私有/管理员
 */
exports.getWeekStatistics = async (req, res) => {
    try {
        const [
            weeklyUploads,
            weeklyUsers,
            weeklyAudits,
            weeklyDownloads
        ] = await Promise.all([
            fileDB.getWeekUploadCount(),
            userDB.getWeekRegisterCount(),
            auditDB.getWeekAuditCount(),
            fileDB.getWeekDownloadCount()
        ]);

        res.status(200).json({
            success: true,
            data: {
                weeklyUploads,
                weeklyUsers,
                weeklyAudits,
                weeklyDownloads
            }
        });
    } catch (error) {
        console.error('获取本周统计数据错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取本月统计数据
 * @route   GET /api/v1/stats/month
 * @access  私有/管理员
 */
exports.getMonthStatistics = async (req, res) => {
    try {
        const [
            monthlyUploads,
            monthlyUsers,
            monthlyAudits,
            monthlyDownloads
        ] = await Promise.all([
            fileDB.getMonthUploadCount(),
            userDB.getMonthRegisterCount(),
            auditDB.getMonthAuditCount(),
            fileDB.getMonthDownloadCount()
        ]);

        res.status(200).json({
            success: true,
            data: {
                monthlyUploads,
                monthlyUsers,
                monthlyAudits,
                monthlyDownloads
            }
        });
    } catch (error) {
        console.error('获取本月统计数据错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取所有统计数据
 * @route   GET /api/v1/stats/all
 * @access  私有/管理员
 */
exports.getAllStatistics = async (req, res) => {
    try {
        const [
            totalUsers,
            totalFiles,
            totalCategories,
            totalTags,
            totalAudits,
            totalDownloads
        ] = await Promise.all([
            userDB.getUserCount(),
            fileDB.getFileCount(),
            categoryDB.getCategoryCount(),
            fileDB.getTagCount(),
            auditDB.getTotalAuditCount(),
            fileDB.getTotalDownloadCount()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalFiles,
                totalCategories,
                totalTags,
                totalAudits,
                totalDownloads
            }
        });
    } catch (error) {
        console.error('获取所有统计数据错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取用户统计数据
 * @route   GET /api/v1/stats/users
 * @access  私有/管理员
 */
exports.getUserStatistics = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            uploaderCount,
            auditorCount
        ] = await Promise.all([
            userDB.getUserCount(),
            userDB.getActiveUserCount(),
            userDB.getUploaderCount(),
            userDB.getAuditorCount()
        ]);

        const userGrowth = await userDB.getUserGrowthTrend();

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                uploaderCount,
                auditorCount,
                userGrowth
            }
        });
    } catch (error) {
        console.error('获取用户统计数据错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取文件审核统计数据
 * @route   GET /api/v1/stats/files/audit
 * @access  私有/管理员
 */
exports.getAuditStatistics = async (req, res) => {
    try {
        const [
            totalAudits,
            pendingFiles,
            approvedFiles,
            rejectedFiles,
            bannedFiles,
            auditTrend
        ] = await Promise.all([
            auditDB.getTotalAuditCount(),
            fileDB.getPendingFileCount(),
            fileDB.getApprovedFileCount(),
            fileDB.getRejectedFileCount(),
            fileDB.getBannedFileCount(),
            auditDB.getAuditTrend()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalAudits,
                pendingFiles,
                approvedFiles,
                rejectedFiles,
                bannedFiles,
                auditTrend
            }
        });
    } catch (error) {
        console.error('获取文件审核统计数据错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取封禁记录统计数据
 * @route   GET /api/v1/stats/ban-record
 * @access  私有/管理员
 */
exports.getBanRecordStatistics = async (req, res) => {
    try {
        const [
            totalBannedFiles,
            totalBannedUsers,
            recentBans,
            banTrend
        ] = await Promise.all([
            fileDB.getBannedFileCount(),
            userDB.getBannedUserCount(),
            auditDB.getRecentBans(),
            auditDB.getBanTrend()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalBannedFiles,
                totalBannedUsers,
                recentBans,
                banTrend
            }
        });
    } catch (error) {
        console.error('获取封禁记录统计数据错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取文件状态分布
 * @route   GET /api/v1/stats/file-status
 * @access  私有/管理员
 */
exports.getFileStatusDistribution = async (req, res) => {
    try {
        const statusDistribution = await fileDB.getFileStatusDistribution();

        res.status(200).json({
            success: true,
            data: statusDistribution
        });
    } catch (error) {
        console.error('获取文件状态分布错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取分类文件数量
 * @route   GET /api/v1/stats/category-files
 * @access  私有/管理员
 */
exports.getCategoryFileCount = async (req, res) => {
    try {
        const categoryFileCount = await fileDB.getFileCountByCategory();

        res.status(200).json({
            success: true,
            data: categoryFileCount
        });
    } catch (error) {
        console.error('获取分类文件数量错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取月度上传统计
 * @route   GET /api/v1/stats/monthly-uploads
 * @access  私有/管理员
 */
exports.getMonthlyUploads = async (req, res) => {
    try {
        const months = req.query.months || 12;
        const monthlyUploads = await fileDB.getMonthlyUploadCount(months);

        res.status(200).json({
            success: true,
            data: monthlyUploads
        });
    } catch (error) {
        console.error('获取月度上传统计错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取审核员统计
 * @route   GET /api/v1/stats/auditors
 * @access  私有/管理员
 */
exports.getAuditorStats = async (req, res) => {
    try {
        const auditorStats = await auditDB.getAuditorStats();

        res.status(200).json({
            success: true,
            data: auditorStats
        });
    } catch (error) {
        console.error('获取审核员统计错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取热门文件
 * @route   GET /api/v1/stats/hot-files
 * @access  公开
 */
exports.getHotFiles = async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const hotFiles = await fileDB.getHotFiles(limit);

        res.status(200).json({
            success: true,
            data: hotFiles
        });
    } catch (error) {
        console.error('获取热门文件错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};