// ========================================
// 자산 데이터 불러오기
// ========================================

let assets = JSON.parse(localStorage.getItem("assets")) || [
    {
        id: "LAPTOP-001",
        name: "삼성 노트북",
        type: "노트북",
        status: "사용 중",
        user: "김철수",
        rentalDate: "2026-09-01",
        returnDate: "2026-09-30"
    }
];


// ========================================
// LocalStorage 저장
// ========================================

function saveAssets() {
    localStorage.setItem("assets", JSON.stringify(assets));
}


// ========================================
// 수정 상태
// ========================================

let editingAssetId = null;


// ========================================
// HTML 요소 가져오기
// ========================================

const assetTableBody = document.getElementById("assetTableBody");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");


// ========================================
// 자산 목록 출력
// ========================================

function renderAssets(keyword = "", status = "전체") {

    assetTableBody.innerHTML = "";

    const filteredAssets = assets.filter(asset => {

        const searchText = keyword.toLowerCase();

        const matchesKeyword =
            asset.id.toLowerCase().includes(searchText) ||
            asset.name.toLowerCase().includes(searchText) ||
            asset.type.toLowerCase().includes(searchText) ||
            (asset.user || "").toLowerCase().includes(searchText);

        const matchesStatus =
            status === "전체" || asset.status === status;

        return matchesKeyword && matchesStatus;
    });


    filteredAssets.forEach(asset => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${asset.id}</td>
            <td>${asset.name}</td>
            <td>${asset.type}</td>
            <td>${asset.status}</td>
            <td>${asset.user || "-"}</td>
            <td>${asset.rentalDate || "-"}</td>
            <td>${asset.returnDate || "-"}</td>

            <td>
                <button onclick="editAsset('${asset.id}')">
                    수정
                </button>

                ${
                    asset.status === "대여 가능"
                    ? `<button onclick="rentAsset('${asset.id}')">대여</button>`
                    : ""
                }

                ${
                    asset.status === "사용 중"
                    ? `<button onclick="returnAsset('${asset.id}')">반납</button>`
                    : ""
                }

                <button onclick="deleteAsset('${asset.id}')">
                    삭제
                </button>
            </td>
        `;

        assetTableBody.appendChild(row);
    });
}


// ========================================
// 검색 기능
// ========================================

searchInput.addEventListener("input", () => {

    renderAssets(
        searchInput.value,
        statusFilter.value
    );

});


// ========================================
// 상태 필터
// ========================================

statusFilter.addEventListener("change", () => {

    renderAssets(
        searchInput.value,
        statusFilter.value
    );

});


// ========================================
// 자산 등록 / 수정
// ========================================

document
    .getElementById("addAssetButton")
    .addEventListener("click", () => {

        const assetId =
            document.getElementById("assetId").value.trim();

        const assetName =
            document.getElementById("assetName").value.trim();

        const assetType =
            document.getElementById("assetType").value;

        const assetStatus =
            document.getElementById("assetStatus").value;

        const assetUser =
            document.getElementById("assetUser").value.trim();


        // 필수값 확인
        if (!assetId || !assetName) {

            alert("자산번호와 자산명은 필수입니다.");

            return;
        }


        // ========================================
        // 수정
        // ========================================

        if (editingAssetId !== null) {

            const asset =
                assets.find(item => item.id === editingAssetId);

            if (asset) {

                asset.id = assetId;
                asset.name = assetName;
                asset.type = assetType;
                asset.status = assetStatus;
                asset.user = assetUser;

                saveAssets();

                editingAssetId = null;

                document.getElementById("addAssetButton").textContent =
                    "등록";

                renderAssets(
                    searchInput.value,
                    statusFilter.value
                );

                updateDashboard();

                clearForm();
            }

            return;
        }


        // ========================================
        // 중복 자산번호 확인
        // ========================================

        const duplicate =
            assets.some(asset => asset.id === assetId);

        if (duplicate) {

            alert("이미 존재하는 자산번호입니다.");

            return;
        }


        // ========================================
        // 신규 자산 등록
        // ========================================

        const newAsset = {

            id: assetId,

            name: assetName,

            type: assetType,

            status: assetStatus,

            user: assetUser,

            rentalDate: "",

            returnDate: ""
        };


        assets.push(newAsset);

        saveAssets();

        renderAssets(
            searchInput.value,
            statusFilter.value
        );

        updateDashboard();

        clearForm();

    });


// ========================================
// 입력창 초기화
// ========================================

function clearForm() {

    document.getElementById("assetId").value = "";

    document.getElementById("assetName").value = "";

    document.getElementById("assetUser").value = "";

}


// ========================================
// 대시보드 업데이트
// ========================================

function updateDashboard() {

    const total = assets.length;

    const using =
        assets.filter(
            asset => asset.status === "사용 중"
        ).length;

    const available =
        assets.filter(
            asset => asset.status === "대여 가능"
        ).length;

    const repair =
        assets.filter(
            asset => asset.status === "수리 중"
        ).length;


    document.getElementById("totalCount").textContent =
        total;

    document.getElementById("usingCount").textContent =
        using;

    document.getElementById("availableCount").textContent =
        available;

    document.getElementById("repairCount").textContent =
        repair;
}


// ========================================
// 자산 삭제
// ========================================

function deleteAsset(id) {

    const confirmed =
        confirm("정말 이 자산을 삭제하시겠습니까?");

    if (!confirmed) {
        return;
    }


    const index =
        assets.findIndex(asset => asset.id === id);

    if (index !== -1) {

        assets.splice(index, 1);

        saveAssets();

        renderAssets(
            searchInput.value,
            statusFilter.value
        );

        updateDashboard();
    }
}


// ========================================
// 자산 수정
// ========================================

function editAsset(id) {

    const asset =
        assets.find(item => item.id === id);

    if (!asset) {
        return;
    }


    editingAssetId = id;


    document.getElementById("assetId").value =
        asset.id;

    document.getElementById("assetName").value =
        asset.name;

    document.getElementById("assetType").value =
        asset.type;

    document.getElementById("assetStatus").value =
        asset.status;

    document.getElementById("assetUser").value =
        asset.user || "";


    document.getElementById("addAssetButton").textContent =
        "수정 저장";
}


// ========================================
// 자산 대여
// ========================================

function rentAsset(id) {

    const asset =
        assets.find(item => item.id === id);

    if (!asset) {
        return;
    }


    const user =
        prompt("대여할 사용자를 입력하세요.");

    if (!user) {
        return;
    }


    const returnDate =
        prompt("반납 예정일을 입력하세요. (예: 2026-09-30)");

    if (!returnDate) {
        return;
    }


    const today =
        new Date().toISOString().split("T")[0];


    asset.status = "사용 중";

    asset.user = user;

    asset.rentalDate = today;

    asset.returnDate = returnDate;


    saveAssets();

    renderAssets(
        searchInput.value,
        statusFilter.value
    );

    updateDashboard();

    alert("자산이 대여되었습니다.");
}


// ========================================
// 자산 반납
// ========================================

function returnAsset(id) {

    const asset =
        assets.find(item => item.id === id);

    if (!asset) {
        return;
    }


    const confirmed =
        confirm(
            `${asset.name}을(를) 반납 처리하시겠습니까?`
        );

    if (!confirmed) {
        return;
    }


    asset.status = "대여 가능";

    asset.user = "";

    asset.rentalDate = "";

    asset.returnDate = "";


    saveAssets();

    renderAssets(
        searchInput.value,
        statusFilter.value
    );

    updateDashboard();

    alert("자산이 반납되었습니다.");
}


// ========================================
// 프로그램 시작
// ========================================

renderAssets();

updateDashboard();