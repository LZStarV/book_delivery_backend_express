const AuditRecord = require('../models/auditRecord');
const File = require('../models/file');
const { protect, authorize } = require('../middleware/auth');

/**
 * @desc    获取审核大厅文件列表
 * @route   GET /api/v1/audits/hall
 * @access  私有/志愿者
 */
exports.getAuditHall = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // 获取待审核文件
        const pendingFiles = await File.getPendingFiles(page, limit);

        res.status(200).json({
            success: true,
            count: pendingFiles.length,
            data: pendingFiles.map(file => file.toJSON())
        });
    } catch (error) {
        console.error('获取审核大厅文件错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取文件的审核记录
 * @route   GET /api/v1/audits/records/file/:fileId
 * @access  私有/志愿者/管理员
 */
exports.getAuditRecordsByFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;

        // 验证文件存在
        const file = await File.getById(fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }

        // 获取审核记录
        const auditRecords = await AuditRecord.getByFileId(fileId);

        res.status(200).json({
            success: true,
            count: auditRecords.length,
            data: auditRecords.map(record => record.toJSON())
        });
    } catch (error) {
        console.error('获取文件审核记录错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取所有审核记录
 * @route   GET /api/v1/audits/records
 * @access  私有/志愿者/管理员
 */
exports.getAuditRecords = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        // 获取审核记录
        const auditRecords = await AuditRecord.getAll(page, limit);

        res.status(200).json({
            success: true,
            count: auditRecords.length,
            data: auditRecords.map(record => record.toJSON())
        });
    } catch (error) {
        console.error('获取所有审核记录错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    审核文件 - 通过
 * @route   PUT /api/v1/audits/approve/:fileId
 * @access  私有/志愿者/管理员
 */
exports.approveFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const { remark } = req.body;
        const auditorId = req.user.id;

        // 验证文件存在
        const file = await File.getById(fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }

        // 检查文件状态
        if (file.auditStatus !== File.FILE_STATUS.PENDING) {
            return res.status(400).json({
                success: false,
                message: `文件当前状态为"${file.auditStatus}"，无法进行审核通过操作`
            });
        }

        // 审核文件
        const updatedFile = await file.updateStatus(
            File.FILE_STATUS.APPROVED,
            auditorId,
            remark || '审核通过'
        );

        res.status(200).json({
            success: true,
            message: '文件审核通过',
            data: updatedFile.toJSON()
        });
    } catch (error) {
        console.error('审核文件通过错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    审核文件 - 拒绝
 * @route   PUT /api/v1/audits/reject/:fileId
 * @access  私有/志愿者/管理员
 */
exports.rejectFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const { remark } = req.body;
        const auditorId = req.user.id;

        // 验证文件存在
        const file = await File.getById(fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }

        // 检查文件状态
        if (file.auditStatus !== File.FILE_STATUS.PENDING) {
            return res.status(400).json({
                success: false,
                message: `文件当前状态为"${file.auditStatus}"，无法进行审核拒绝操作`
            });
        }

        // 审核文件
        const updatedFile = await file.updateStatus(
            File.FILE_STATUS.REJECTED,
            auditorId,
            remark || '审核拒绝'
        );

        res.status(200).json({
            success: true,
            message: '文件审核拒绝',
            data: updatedFile.toJSON()
        });
    } catch (error) {
        console.error('审核文件拒绝错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    封禁文件
 * @route   PUT /api/v1/audits/ban/:fileId
 * @access  私有/管理员
 */
exports.banFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const { remark } = req.body;
        const operatorId = req.user.id;

        // 验证文件存在
        const file = await File.getById(fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }

        // 检查文件状态
        if (file.auditStatus === File.FILE_STATUS.BANNED) {
            return res.status(400).json({
                success: false,
                message: '文件已被封禁'
            });
        }

        // 封禁文件
        const updatedFile = await file.updateStatus(
            File.FILE_STATUS.BANNED,
            operatorId,
            remark || '文件封禁'
        );

        res.status(200).json({
            success: true,
            message: '文件已封禁',
            data: updatedFile.toJSON()
        });
    } catch (error) {
        console.error('封禁文件错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    解封文件
 * @route   PUT /api/v1/audits/unban/:fileId
 * @access  私有/管理员
 */
exports.unbanFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const { remark } = req.body;
        const operatorId = req.user.id;

        // 验证文件存在
        const file = await File.getById(fileId);
        if (!file) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }

        // 检查文件状态
        if (file.auditStatus !== File.FILE_STATUS.BANNED) {
            return res.status(400).json({
                success: false,
                message: '文件未被封禁，无需解封'
            });
        }

        // 解封文件
        const updatedFile = await file.updateStatus(
            File.FILE_STATUS.APPROVED,
            operatorId,
            remark || '文件解封'
        );

        res.status(200).json({
            success: true,
            message: '文件已解封',
            data: updatedFile.toJSON()
        });
    } catch (error) {
        console.error('解封文件错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};