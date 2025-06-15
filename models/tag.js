const tagDB = require('../databases/tagDB');

class Tag {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.isFixed = data.is_fixed === 1;
        this.status = data.status;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    /**
     * 获取所有固定标签
     */
    static async getAllFixedTags() {
        const tagsData = await tagDB.getFixedTags();
        return tagsData.map(data => new Tag(data));
    }

    /**
     * 根据ID获取标签
     */
    static async getById(id) {
        const tagData = await tagDB.getFixedTagById(id);
        return tagData ? new Tag(tagData) : null;
    }

    /**
     * 创建新标签
     */
    static async create(data) {
        const tagId = await tagDB.createFixedTag(data);
        return new Tag({ id: tagId, ...data });
    }

    /**
     * 更新标签信息
     */
    async update(data) {
        const updatedData = {
            ...data,
            updated_at: new Date()
        };

        await tagDB.updateFixedTag(this.id, updatedData);
        Object.assign(this, updatedData);
        return this;
    }

    /**
     * 删除标签
     */
    async delete() {
        return await tagDB.deleteFixedTag(this.id);
    }

    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            isFixed: this.isFixed,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Tag;