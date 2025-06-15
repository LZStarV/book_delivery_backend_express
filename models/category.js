const categoryDB = require('../databases/categoryDB');

class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.parentId = data.parent_id;
        this.sortOrder = data.sort_order;
        this.status = data.status;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    /**
     * 获取所有分类
     */
    static async getAll() {
        const categoriesData = await categoryDB.getAllCategories();
        return categoriesData.map(data => new Category(data));
    }

    /**
     * 根据ID获取分类
     */
    static async getById(id) {
        const categoryData = await categoryDB.getCategoryById(id);
        return categoryData ? new Category(categoryData) : null;
    }

    /**
     * 创建新分类
     */
    static async create(data) {
        const categoryId = await categoryDB.createCategory(data);
        return new Category({ id: categoryId, ...data });
    }

    /**
     * 更新分类信息
     */
    async update(data) {
        const updatedData = {
            ...data,
            updated_at: new Date()
        };

        await categoryDB.updateCategory(this.id, updatedData);
        Object.assign(this, updatedData);
        return this;
    }

    /**
     * 删除分类
     */
    async delete() {
        return await categoryDB.deleteCategory(this.id);
    }

    /**
     * 检查分类是否存在
     */
    static async exists(id) {
        return await categoryDB.checkCategoryExists(id);
    }

    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            parentId: this.parentId,
            sortOrder: this.sortOrder,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Category;