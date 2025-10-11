//! Import các thư viện và modules cần thiết
import { create } from "zustand"; // Zustand tạo store để quản lý state toàn cục
import { persist } from "zustand/middleware"; // Persist middleware cho localStorage

//! API endpoint - tương tự logic trong axios.js
const API_ENDPOINT = import.meta.env.MODE === "development"
  ? import.meta.env.VITE_API_BASE || 'http://localhost:5000'
  : import.meta.env.VITE_API_BASE_PROD || 'https://milk-tea-backend.onrender.com';

// Debug logging
console.log('🏪 AddressStore Environment:', import.meta.env.MODE);
console.log('🌐 AddressStore API Endpoint:', API_ENDPOINT);

// ——— Debounce nhỏ cho UX mượt ———
let debounceTimer;
const debounce = (fn, delay = 600) => (...args) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fn(...args), delay);
}

export const useAddressStore = create((set, get) => ({
    // Trạng thái dữ liệu
    provinces: [],
    districts: [],
    wards: [],

    // Trạng thái chọn lựa
    selectedProvince: null,
    selectedDistrict: null,
    selectedWard: null,
    street: '',

    // UI
    coordinates: null,
    loading: false,
    error: null,

    API: API_ENDPOINT,

    //! Lấy các tỉnh/thành Việt Nam
    loadProvinces: async () => {
        const API = get().API;
        set({ loading: true, erro: null });
        try {
            const res = await fetch(`${API}/api/provinces?depth=1`); // Chỉ lấy tỉnh/thành (depth=1)
            if (!res.ok) throw new Error('fetch provinces failed');
            const data = await res.json();
            set({ provinces: data.sort((a, b) => a.name.localeCompare(b.name)) }); // Sắp xếp theo tên
        } catch (e) {
            console.error('🚨 LoadProvinces Error:', e);
            set({ error: e.message || 'Lỗi tải danh sách tỉnh/thành' });
        } finally {
            set({ loading: false });
        }
    },

    //! Chọn tỉnh/thành
    selectProvince: async (provinceCode) => {
        const API = get().API;
        if (!provinceCode) {
            set({
                selectedProvince: null,
                districts: [],
                selectedDistrict: null,
                wards: [],
                selectedWard: null,
                street: '',
                coordinates: null,
            });
            return;
        }

        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API}/api/provinces/${provinceCode}?depth=2`); // Lấy cả quận/huyện (depth=2)
            if (!res.ok) throw new Error('fetch districts failed');
            const data = await res.json();
            set({
                selectedProvince: data,
                districts: (data.districts || []).sort((a, b) => a.name.localeCompare(b.name)), // Sắp xếp theo tên
                selectedDistrict: null,
                wards: [],
                selectedWard: null,
                street: '',
                coordinates: null,
            });
        } catch (e) {
            console.error('🚨 SelectProvince Error:', e);
            set({ error: 'Không tải được danh sách quận/huyện' });
        } finally {
            set({ loading: false });
        }
    },

    //! Lấy các quận/huyện theo tỉnh/thành đã chọn
    selectDistrict: async (districtCode) => {
        const API = get().API;
        if (!districtCode) {
            set({
                selectedDistrict: null,
                wards: [],
                selectedWard: null,
                street: '',
                coordinates: null,
            });
            return;
        }
        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API}/api/districts/${districtCode}?depth=2`); // Lấy cả phường/xã (depth=2)
            if (!res.ok) throw new Error('fetch wards failed');
            const data = await res.json();
            set({
                selectedDistrict: data,
                wards: (data.wards || []).sort((a, b) => a.name.localeCompare(b.name)),
                selectedWard: null,
                street: '',
                coordinates: null,
            });
        } catch (e) {
            console.error('🚨 SelectDistrict Error:', e);
            set({ error: 'Không tải được danh sách phường/xã' });
        } finally {
            set({ loading: false });
        }
    },

    //! Chọn quận/huyện
    selectWard: (wardCode) => {
        const ward = get().wards.find((w) => String(w.code) === String(wardCode));
        set({ selectedWard: ward || null, street: '', coordinates: null });
    },

    //! Chọn đường
    setStreet: (s) => set({ street: s }),

    //! Lấy tọa độ địa chỉ hiện tại (sử dụng API Geocoding của DistanceMatrix.ai qua backend)
    buildAddress: () => {
        const { selectedProvince, selectedDistrict, selectedWard, street } = get();
        const parts = [
            street?.trim(),                 // ví dụ: "337/2ThạchLam"
            selectedWard?.name,             // "Phường Phú Thạnh"
            selectedDistrict?.name,         // "Quận Tân Phú"
            selectedProvince?.name,         // "Thành phố Hồ Chí Minh"
            'Việt Nam',
        ].filter(Boolean);
        return parts.join(', ');
    },

    //! Lấy toạ độ thô (không debounce)
    geocodeRaw: async () => {
        const API = get().API;
        const address = get().buildAddress();

        if (!address) {
            set({ error: 'Vui lòng nhập địa chỉ/đường và chọn đủ khu vực' });
            return;
        }

        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API}/api/geocode?address=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || 'geocode failed');
            // Server trả { lat, lng }
            set({ coordinates: data });
        } catch (e) {
            console.error('🚨 Geocode Error:', e);
            set({ error: 'Không tìm được toạ độ cho địa chỉ đã nhập', coordinates: null });
        } finally {
            set({ loading: false });
        }
    },

    //! Lấy toạ độ có debounce
    geocode: debounce(() => get().geocodeRaw(), 700),

    //! Autocomplete địa chỉ với Google Places API (chạy trên client)
    autocompletePlaces: async (query, signal = null) => {
        const API = get().API;
        if (!query || query.length < 2) return { suggestions: [] };

        try {
            console.log('Autocomplete query:', query);
            const params = new URLSearchParams({ text: query });

            const fetchOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            // Add abort signal if provided
            if (signal) {
                fetchOptions.signal = signal;
            }

            const res = await fetch(`${API}/api/autocomplete-place?${params}`, fetchOptions);

            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

            const data = await res.json();
            return data || { suggestions: [] };
        } catch (e) {
            if (e.name === 'AbortError') {
                console.log('Request aborted');
                throw e; // Re-throw to handle in component
            }
            console.error('🚨 Autocomplete error:', e);
            return { suggestions: [] };
        }
    },

    //! Phân tích địa chỉ từ gợi ý (suggestion) của Google Places và set vào store
    parseAndSetAddressFromSelection: async (suggestion) => {
        const { label, name, region, address } = suggestion;

        console.log('Parsing suggestion:', suggestion);

        try {
            // Parse từ label: "Passio Coffee 184 Lê Đại Hành, 184 Đường Lê Đại Hành, Phường 15, Quận 11, thành phố Hồ Chí Minh"
            const parts = label.split(', ');

            // Các biến tạm để lưu phần đã parse
            let provinceText = ''; // thành phố, tỉnh
            let districtText = ''; // quận, huyện
            let wardText = '';     // phường, xã, thị trấn
            let streetText = '';   // đường

            // Tìm các phần của địa chỉ với logic cải thiện
            parts.forEach((part, index) => {
                const trimmed = part.trim();
                const lowerTrimmed = trimmed.toLowerCase();

                // Province (thành phố, tỉnh)
                if (lowerTrimmed.includes('thành phố') || lowerTrimmed.includes('tỉnh')) {
                    provinceText = trimmed;
                }
                // District (quận, huyện) 
                else if (lowerTrimmed.includes('quận') || lowerTrimmed.includes('huyện')) {
                    districtText = trimmed;
                }
                // Ward (phường, xã, thị trấn)
                else if (lowerTrimmed.includes('phường') || lowerTrimmed.includes('xã') || lowerTrimmed.includes('thị trấn')) {
                    wardText = trimmed;
                }
                // Street - tìm phần có "đường" và số nhà
                else if (lowerTrimmed.includes('đường')) {
                    // Nếu chưa có streetText hoặc part này dài hơn (chi tiết hơn)
                    if (!streetText || trimmed.length > streetText.length) {
                        streetText = trimmed;
                    }
                }
                // Backup: nếu có số ở đầu và chưa có streetText
                else if (!streetText && /^\d+/.test(trimmed)) {
                    streetText = trimmed;
                }
            });

            // Smart fallback: nếu không tìm được district/ward, thử pattern matching
            if (!districtText || !wardText) {
                parts.forEach(part => {
                    const trimmed = part.trim();

                    // Pattern: "Quận 11", "Quận 1", "Huyện Cần Giờ"
                    if (!districtText && /^(quận|huyện)\s+[\w\s]+$/i.test(trimmed)) {
                        districtText = trimmed;
                    }

                    // Pattern: "Phường 15", "Phường Bến Nghé", "Xã Tân Phong"  
                    if (!wardText && /^(phường|xã|thị trấn)\s+[\w\s]+$/i.test(trimmed)) {
                        wardText = trimmed;
                    }
                });
            }

            console.log('DỮ LIỆU ĐÃ ĐƯỢC PARSE:', { provinceText, districtText, wardText, streetText });

            // Set địa chỉ street trước
            set({ street: streetText || address || '' });

            // Ensure provinces are loaded
            const provinces = get().provinces;
            if (!provinces || provinces.length === 0) {
                console.log('Loading provinces first...');
                await get().loadProvinces();
            }

            // Tìm và set province
            if (provinceText) {
                const updatedProvinces = get().provinces;
                const foundProvince = updatedProvinces.find(p => {
                    const pNameLower = p.name.toLowerCase();
                    const provinceLower = provinceText.toLowerCase();

                    // Exact match first
                    if (pNameLower === provinceLower) return true;

                    // Provinces usually have longer names, use contains but prioritize longer matches
                    return pNameLower.includes(provinceLower) || provinceLower.includes(pNameLower);
                });

                if (foundProvince) {
                    console.log('🏙️ Found province:', foundProvince.name);

                    // Call API trực tiếp để lấy districts
                    if (districtText) {
                        try {
                            const API = get().API;
                            const res = await fetch(`${API}/api/provinces/${foundProvince.code}?depth=2`);
                            if (res.ok) {
                                const data = await res.json();
                                console.log("DISTRICT BIG DATA - DATA", data)
                                const districts = data.districts || [];
                                console.log("DISTRICT BIG DATA - DISTRICTS", districts)

                                const foundDistrict = districts.find(d => {
                                    const dNameLower = d.name.toLowerCase();
                                    const districtLower = districtText.toLowerCase();

                                    // Exact match first (highest priority)
                                    if (dNameLower === districtLower) return true;

                                    // Extract số quận/huyện để so sánh chính xác
                                    const districtNumber = districtText.match(/(\d+)/)?.[1];
                                    const dNumber = d.name.match(/(\d+)/)?.[1];

                                    // Nếu cả hai có số, so sánh số
                                    if (districtNumber && dNumber) {
                                        return districtNumber === dNumber;
                                    }

                                    // Fallback: kiểm tra bao hàm nhưng chỉ khi độ dài gần nhau
                                    const lengthDiff = Math.abs(dNameLower.length - districtLower.length);
                                    if (lengthDiff <= 3) {
                                        return dNameLower.includes(districtLower) || districtLower.includes(dNameLower);
                                    }

                                    return false;
                                });

                                console.log("DISTRICT TEXT", districtText)

                                console.log("FOUND DISTRICT", foundDistrict)

                                if (foundDistrict) {
                                    // Call API trực tiếp để lấy wards
                                    if (wardText) {
                                        try {
                                            const wardRes = await fetch(`${API}/api/districts/${foundDistrict.code}?depth=2`);
                                            if (wardRes.ok) {
                                                const wardData = await wardRes.json();
                                                const wards = wardData.wards || [];

                                                const foundWard = wards.find(w => {
                                                    const wNameLower = w.name.toLowerCase();
                                                    const wardLower = wardText.toLowerCase();

                                                    // Exact match first
                                                    if (wNameLower === wardLower) return true;

                                                    // Extract số phường để so sánh chính xác
                                                    const wardNumber = wardText.match(/(\d+)/)?.[1];
                                                    const wNumber = w.name.match(/(\d+)/)?.[1];

                                                    // Nếu cả hai có số, so sánh số
                                                    if (wardNumber && wNumber) {
                                                        return wardNumber === wNumber;
                                                    }

                                                    // Fallback: kiểm tra bao hàm với độ dài gần nhau
                                                    const lengthDiff = Math.abs(wNameLower.length - wardLower.length);
                                                    if (lengthDiff <= 3) {
                                                        return wNameLower.includes(wardLower) || wardLower.includes(wNameLower);
                                                    }

                                                    return false;
                                                });

                                                if (foundWard) {
                                                    console.log('Found ward:', foundWard.name);

                                                    // Set tất cả cùng lúc
                                                    set({
                                                        selectedProvince: foundProvince,
                                                        districts: districts.sort((a, b) => a.name.localeCompare(b.name)),
                                                        selectedDistrict: foundDistrict,
                                                        wards: wards.sort((a, b) => a.name.localeCompare(b.name)),
                                                        selectedWard: foundWard,
                                                        street: streetText || address || ''
                                                    });
                                                } else {
                                                    console.log('Ward not found:', wardText);
                                                    // Set province + district, không có ward
                                                    set({
                                                        selectedProvince: foundProvince,
                                                        districts: districts.sort((a, b) => a.name.localeCompare(b.name)),
                                                        selectedDistrict: foundDistrict,
                                                        wards: wards.sort((a, b) => a.name.localeCompare(b.name)),
                                                        selectedWard: null,
                                                        street: streetText || address || ''
                                                    });
                                                }
                                            }
                                        } catch (wardError) {
                                            console.error('Error fetching wards:', wardError);
                                            // Fallback: chỉ set province + district
                                            set({
                                                selectedProvince: foundProvince,
                                                districts: districts.sort((a, b) => a.name.localeCompare(b.name)),
                                                selectedDistrict: foundDistrict,
                                                wards: [],
                                                selectedWard: null,
                                                street: streetText || address || ''
                                            });
                                        }
                                    } else {
                                        // Không có wardText, chỉ set province + district
                                        set({
                                            selectedProvince: foundProvince,
                                            districts: districts.sort((a, b) => a.name.localeCompare(b.name)),
                                            selectedDistrict: foundDistrict,
                                            wards: [],
                                            selectedWard: null,
                                            street: streetText || address || ''
                                        });
                                    }
                                } else {
                                    console.log('District not found:', districtText);
                                    // Chỉ set province
                                    set({
                                        selectedProvince: foundProvince,
                                        districts: districts.sort((a, b) => a.name.localeCompare(b.name)),
                                        selectedDistrict: null,
                                        wards: [],
                                        selectedWard: null,
                                        street: streetText || address || ''
                                    });
                                }
                            }
                        } catch (districtError) {
                            console.error('Error fetching districts:', districtError);
                            // Fallback: chỉ set province bằng function có sẵn
                            await get().selectProvince(foundProvince.code);
                        }
                    } else {
                        // Không có districtText, chỉ set province
                        await get().selectProvince(foundProvince.code);
                    }
                } else {
                    console.log('Province not found:', provinceText);
                }
            }

            return {
                success: true,
                parsed: { provinceText, districtText, wardText, streetText }
            };

        } catch (error) {
            console.error('Error parsing address:', error);
            return { success: false, error: error.message };
        }
    }
}))