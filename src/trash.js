{/* Nút filter 2 - AdminProduct.jsx */ }
{/* <div className="flex flex-wrap gap-4 items-center justify-between">
    <div className="relative" ref={filterRef2}>
        <button
            onClick={() => setShowFilter2(!showFilter2)}
            className="flex items-center gap-2 px-4 py-2 border border-green-500 rounded-lg hover:bg-green-50 transition-colors bg-green-50"
        >
            <Filter className="w-4 h-4 text-green-600" />
            Bộ lọc
            <ChevronDown
                className={`w-4 h-4 text-green-600 transition-transform ${showFilter2 ? "rotate-180" : ""
                    }`}
            />
        </button>

        {showFilter2 && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-green-200 rounded-lg shadow-lg z-50 p-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tên sản phẩm..."
                                value={searchTerm2}
                                onChange={(e) => setSearchTerm2(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={statusFilter2}
                            onChange={(e) => setStatusFilter2(e.target.value)}
                            className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="available">Đang bán</option>
                            <option value="unavailable">Ngừng bán</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                            Danh mục
                        </label>
                        <select
                            value={categoryFilter2}
                            onChange={(e) => setCategoryFilter2(e.target.value)}
                            className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả danh mục</option>
                            {availableCategories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                            Sắp xếp
                        </label>
                        <select
                            value={sortOption2}
                            onChange={(e) => setSortOption2(e.target.value)}
                            className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">Không sắp xếp</option>
                            <option value="price-asc">Giá: Tăng dần</option>
                            <option value="price-desc">Giá: Giảm dần</option>
                            <option value="date-asc">Ngày: Cũ nhất</option>
                            <option value="date-desc">Ngày: Mới nhất</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                            Hiển thị mỗi trang
                        </label>
                        <select
                            value={itemsPerPage2}
                            onChange={(e) =>
                                setItemsPerPage2(parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="5">5 sản phẩm / trang</option>
                            <option value="10">10 sản phẩm / trang</option>
                            <option value="15">15 sản phẩm / trang</option>
                            <option value="20">20 sản phẩm / trang</option>
                        </select>
                    </div>
                </div>
            </div>
        )}
    </div>
</div> */ }