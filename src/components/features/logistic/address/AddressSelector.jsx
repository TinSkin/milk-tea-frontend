import React, { useEffect, useState, useRef } from "react";
import { MapPin, Navigation, Search } from "lucide-react";
import { useAddressStore } from "../../../../store/addressStore";

const AddressSelector = ({ errors = {} }) => {
  // Sử dụng store địa chỉ
  const {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    street,
    coordinates,
    loading,
    error,
    loadProvinces,
    selectProvince,
    selectDistrict,
    selectWard,
    setStreet,
    geocode,
    autocompleteStreets,
    autocompletePlaces,
    parseAndSetAddressFromSelection,
  } = useAddressStore();

  // Ref cho input tên đường
  const streetInputRef = useRef(null);

  // Trạng thái dành cho autocomplete
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState({}); // Selected suggestion
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const addressInputRef = useRef(null);
  const addressDropdownRef = useRef(null);

  //! Openmaps cần paramenter:
  // - text: từ khóa tìm kiếm - bắt buộc
  // - location: Vị trí để ưu tiên tìm kiếm, tọa độ hiện tại (lat,lng) - tùy chọn
  // - radius: Giới hạn tìm kiếm trong bán kính từ vị trí chỉ định (đơn vị: km) - tùy chọn
  // - origin: Điểm xuất phát để tính khoảng cách đường thẳng đến điểm đích (được trả về dưới dạng distance_meters). Phải được chỉ định dưới dạng vĩ độ,kinh độ - tùy chọn
  // - sessiontoken: Mã UUID v4 để nhóm nhiều yêu cầu Autocomplete trong một phiên - tùy chọn
  // - admin_v2: Mã hành chính cấp 2 (tỉnh/thành) để giới hạn kết quả trả về - tùy chọn

  // Tối ưu hóa hiệu suất với debounce và abort controller
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map()); // Simple cache

  //! Xử lí thay đổi input địa chỉ
  const handleAutocompleteChange = async (e) => {
    const value = e.target.value;
    setAddress(value);

    // CLEAR PREVIOUS DEBOUNCE
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // CANCEL PREVIOUS REQUEST
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // MINIMUM CHARACTER THRESHOLD
    if (value.length < 2) {
      setPlaceSuggestions([]);
      setShowAutocomplete(false);
      setIsSuggestionsLoading(false);
      return;
    }

    // CHECK CACHE FIRST
    const cacheKey = value.toLowerCase().trim();
    if (cacheRef.current.has(cacheKey)) {
      console.log("CACHE HIT for:", cacheKey);
      const cachedSuggestions = cacheRef.current.get(cacheKey);
      setPlaceSuggestions(cachedSuggestions);
      setShowAutocomplete(true); // Always show dropdown, even if no suggestions
      return;
    }

    // DEBOUNCE API CALL (400ms)
    setIsSuggestionsLoading(true);
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();

        console.log("API CALL for:", value);
        const response = await autocompletePlaces(
          value,
          abortControllerRef.current.signal
        );

        // Check if request was aborted
        if (abortControllerRef.current.signal.aborted) {
          console.log("REQUEST ABORTED");
          return;
        }

        const suggestions = response.suggestions || [];

        // 6. CACHE THE RESULT (max 50 entries)
        if (cacheRef.current.size >= 50) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(cacheKey, suggestions);

        setPlaceSuggestions(suggestions);
        setShowAutocomplete(true); // Always show dropdown when we have response
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Autocomplete error:", error);
          setPlaceSuggestions([]);
          setShowAutocomplete(false);
        }
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 400); // 400ms debounce
  };

  //! Xử lí khi chọn một gợi ý từ autocomplete
  const handleAutocompleteSelect = async (suggestion) => {
    console.log("CLICKED SUGGESTION:", suggestion);

    // Parse và set các dropdown từ địa chỉ OpenMaps
    const result = await parseAndSetAddressFromSelection(suggestion);

    if (result.success) {
      console.log("Successfully parsed and set address");
    } else {
      console.error("Failed to parse address:", result.error);
      // Fallback: chỉ set text input
      setAddress(suggestion.label || suggestion.name || "");
    }

    setAddress(suggestion.label || suggestion.name || "");

    setShowAutocomplete(false);
    setPlaceSuggestions([]);
    geocode(); // Lấy tọa độ ngay khi chọn địa chỉ
  };

  //! Xử lí khi click vào input địa chỉ
  const handleAutocompleteClick = () => {
    // Show dropdown if we have input >= 2 chars (regardless of suggestions)
    if (address.length >= 2) {
      setShowAutocomplete(true);
    }
  };

  //! Debug: Log state khi placeSuggestions thay đổi
  useEffect(() => {
    console.log("State updated:", placeSuggestions);
    console.log("Selected suggestion:", suggestions);
  }, [placeSuggestions, suggestions]);

  // Dọn dẹp khi component unmount
  useEffect(() => {
    return () => {
      // Xóa debounce timer nếu có
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      // Dừng request nếu component unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Xóa cache khi component unmount để tránh chiếm dụng bộ nhớ lâu dài
      cacheRef.current.clear();
    };
  }, []);

  useEffect(() => {
    // Load danh sách tỉnh/thành khi component mount
    loadProvinces();
  }, [loadProvinces]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Also handle address autocomplete - but exclude dropdown clicks
      if (
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target)
      ) {
        // Check if click is inside the dropdown using ref
        if (
          !addressDropdownRef.current ||
          !addressDropdownRef.current.contains(event.target)
        ) {
          setShowAutocomplete(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Tỉnh/Thành phố */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Tỉnh/Thành phố *
        </label>
        <select
          value={selectedProvince?.code || ""}
          onChange={(e) => selectProvince(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.province ? "border-red-500" : ""
          }`}
        >
          <option value="">-- Chọn tỉnh/thành --</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.province && (
          <p className="text-red-500 text-sm mt-1">{errors.province}</p>
        )}
      </div>
      {/* Quận/Huyện */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Quận/Huyện *
        </label>
        <select
          value={selectedDistrict?.code || ""}
          onChange={(e) => selectDistrict(e.target.value)}
          disabled={!selectedProvince}
          className={`w-full px-4 py-3 border rounded-lg disabled:bg-gray-100 ${
            errors.district ? "border-red-500" : ""
          }`}
        >
          <option value="">-- Chọn quận/huyện --</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
        {errors.district && (
          <p className="text-red-500 text-sm mt-1">{errors.district}</p>
        )}
      </div>
      {/* Phường/Xã */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Phường/Xã *
        </label>
        <select
          value={selectedWard?.code || ""}
          onChange={(e) => selectWard(e.target.value)}
          disabled={!selectedDistrict}
          className={`w-full px-4 py-3 border rounded-lg disabled:bg-gray-100 ${
            errors.ward ? "border-red-500" : ""
          }`}
        >
          <option value="">-- Chọn phường/xã --</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
        {errors.ward && (
          <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
        )}
      </div>
      {/* Street */}
      <div className="relative mt-2 col-span-2">
        <label className="block text-sm font-medium text-white mb-2">
          Tên đường *
        </label>
        <div className="relative">
          <input
            ref={streetInputRef}
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Ví dụ: 2 Nguyễn Huệ"
            className={`w-full px-4 py-3 border rounded-lg pr-10 ${
              errors.street ? "border-red-500" : ""
            }`}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-camel w-5 h-5" />
        </div>
        {errors.street && (
          <p className="text-red-500 text-sm mt-1">{errors.street}</p>
        )}
      </div>
      {/* Địa chỉ cụ thể (có autocomplete) */}
      <div className="relative mt-2 col-span-2">
        <label className="block text-sm font-medium text-white mb-2">
          Địa chỉ cụ thể *
        </label>
        <div className="relative">
          <input
            ref={addressInputRef}
            value={address}
            onChange={handleAutocompleteChange}
            onClick={handleAutocompleteClick}
            placeholder="Nhập địa chỉ đầy đủ nếu muốn"
            className="w-full px-4 py-3 border rounded-lg"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-camel w-5 h-5" />
          {isSuggestionsLoading && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        <p className="text-sm mt-1 text-camel">
          Địa chỉ đầy đủ sẽ được sử dụng để tìm kiếm chính xác hơn.
        </p>

        {/* Autocomplete Dropdown */}
        {showAutocomplete && (
          <div
            ref={addressDropdownRef}
            className="address-dropdown absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 9999,
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }}
          >
            {placeSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={(e) => {
                  console.log("🔥 DROPDOWN ITEM CLICKED!");
                  e.preventDefault();
                  e.stopPropagation();
                  handleAutocompleteSelect(suggestion);
                }}
                onMouseEnter={() =>
                  console.log("🖱️ HOVER SUGGESTION:", suggestion.name)
                }
                style={{
                  position: "relative",
                  zIndex: 10000,
                  pointerEvents: "auto",
                }}
              >
                <div className="text-sm font-medium text-gray-900">
                  {suggestion.name}
                </div>
                <div className="text-xs text-gray-500">{suggestion.label}</div>
              </div>
            ))}
            {placeSuggestions.length === 0 &&
              !isSuggestionsLoading &&
              address.length >= 2 && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Không tìm thấy địa chỉ phù hợp cho "{address}"
                </div>
              )}
            {isSuggestionsLoading && (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Đang tìm kiếm...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result */}
      <div className="space-y-6 col-span-2">
        {/* Thông tin địa chỉ đã chọn */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Xác nhận địa chỉ đã chọn
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Tỉnh/Thành phố
                  </p>
                  <p className="font-semibold text-gray-800">
                    {selectedProvince?.name || (
                      <span className="text-gray-400 italic">Chưa chọn</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Quận/Huyện
                  </p>
                  <p className="font-semibold text-gray-800">
                    {selectedDistrict?.name || (
                      <span className="text-gray-400 italic">Chưa chọn</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Phường/Xã
                  </p>
                  <p className="font-semibold text-gray-800">
                    {selectedWard?.name || (
                      <span className="text-gray-400 italic">Chưa chọn</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Tên đường
                  </p>
                  <p className="font-semibold text-gray-800">
                    {street || (
                      <span className="text-gray-400 italic">Chưa nhập</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Địa chỉ đầy đủ */}
          {address && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">
                Địa chỉ đầy đủ
              </p>
              <p className="text-blue-800 font-medium">{address}</p>
            </div>
          )}
        </div>

        {/* Tọa độ GPS */}
        {coordinates && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 shadow-lg border border-emerald-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-800">
                  Tọa độ GPS
                </h3>
                <p className="text-sm text-emerald-600">
                  Vị trí chính xác đã xác định
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/80 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 uppercase tracking-wide">
                  Vĩ độ (Latitude)
                </p>
                <p className="font-mono text-lg font-bold text-emerald-800">
                  {coordinates.lat}
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-emerald-600 uppercase tracking-wide">
                  Kinh độ (Longitude)
                </p>
                <p className="font-mono text-lg font-bold text-emerald-800">
                  {coordinates.lng}
                </p>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=17`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
            >
              <MapPin className="w-4 h-4" />
              Xem trên Google Maps
            </a>
          </div>
        )}

        {/* Xác định vị trí */}
        {!coordinates && (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Chọn/nhập địa chỉ rồi đợi lấy tọa độ
            </p>
          </div>
        )}

        {/* Bản đồ nhúng */}
        {coordinates && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Bản đồ vị trí
              </h3>
            </div>
            <div className="p-2">
              <iframe
                width="100%"
                height="300"
                style={{ border: "none", borderRadius: "8px" }}
                src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=17&output=embed`}
                allowFullScreen
                title="Bản đồ vị trí đã chọn"
                className="rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </>
  );
};

export default AddressSelector;
