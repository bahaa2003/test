/**
 * فئة لمعالجة ميزات API مثل التصفية والبحث والترتيب والصفحات
 */
export class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
    this.pagination = {};
  }

  /**
   * تصفية النتائج
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields', 'keyword', 'search'];

    excludedFields.forEach(field => delete queryObj[field]);

    // معالجة عوامل المقارنة
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|nin)\b/g, match => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * البحث في النص
   */
  search(searchFields = ['name']) {
    if (this.queryString.keyword || this.queryString.search) {
      const keyword = this.queryString.keyword || this.queryString.search;
      const searchQuery = searchFields.map(field => ({
        [field]: { $regex: keyword, $options: 'i' }
      }));

      this.mongooseQuery = this.mongooseQuery.find({
        $or: searchQuery
      });
    }
    return this;
  }

  /**
   * ترتيب النتائج
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    return this;
  }

  /**
   * تحديد الحقول المطلوبة
   */
  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
  }

  /**
   * تقسيم النتائج إلى صفحات
   */
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 50;
    const skip = (page - 1) * limit;

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    this.pagination = {
      page,
      limit,
      skip
    };

    return this;
  }

  /**
   * الحصول على إحصائيات الصفحات
   */
  async getPaginationStats(totalDocs) {
    const { page, limit } = this.pagination;
    const totalPages = Math.ceil(totalDocs / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      currentPage: page,
      totalPages,
      totalDocs,
      limit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    };
  }
}
