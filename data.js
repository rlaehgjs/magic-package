// Resource Definitions (ID -> Display Name)
const RESOURCE_NAMES = {
    ruby: "루비",
    ap: "어빌리티 포인트",
    magic: "마법",
    dimension_key: "차원의 열쇠",
    dungeon_key: "던전 열쇠",
    exploration_key: "탐험 열쇠",
    golden_key: "황금 열쇠",
    silver_key: "은 열쇠",
    faded_medal: "빛바랜 명예 훈장",
    hunter_medal: "사냥꾼의 훈장",
    dimension_fragment: "차원의 조각",
    time_scroll: "시간 스크롤",
    abyss_scroll: "심층 스크롤",
    magic_stone: "마정석",
    transcendence_stone: "초월석",
    magic_draw: "마뽑",
    mystery_crystal: "신비한 차원의 결정",
    top_amulet: "최상급 아뮬렛",
    random_box: "정령의 성장 상자"
};

// Main Data
const packages = [
    {
        id: "burning_boost",
        name: "버닝 부스트 패키지",
        price: 1500,
        count: 1,
        tier: "S",
        description: "마정석과 어빌리티 포인트를 대량으로 얻을 수 있는 초보자 추천 패키지.",
        contents: {
            magic_stone: 130000000,
            ruby: 5500000,
            ap: 2250000,
            dimension_key: 4500,
            magic: 15000,
            faded_medal: 1500000,
            hunter_medal: 400000,
            transcendence_stone: 1300
        }
        // valueScore calculated dynamically later based on Ruby efficiency? 
        // For now, let's inject manual score or calculate in main.js
    },
    {
        id: "memorial_costume",
        name: "메모리얼 코스튬",
        price: 29700,
        count: 2,
        tier: "A",
        description: "코스튬과 함께 다양한 열쇠를 획득할 수 있습니다.",
        contents: {
            ruby: -300000, // Negative ruby based on user input? Keeping as is.
            ap: 10000000,
            dungeon_key: 2025,
            dimension_fragment: 2200,
            exploration_key: 150,
            abyss_scroll: 1725,
            golden_key: 2,
            magic_draw: 100000,
            mystery_crystal: 180,
            time_scroll: 75,
            transcendence_stone: 300000
        }
    },
    {
        id: "ad_removal",
        name: "광고 제거",
        price: 12000,
        count: 1,
        tier: "S",
        description: "필수 구매! 광고 없이 쾌적한 게임 플레이.",
        contents: {
            ruby: 120000,
            dungeon_key: 160,
            dimension_fragment: 240,
            golden_key: 1
        }
    },
    {
        id: "dimension_pile",
        name: "차원의 조각 무더기",
        price: 16000,
        count: 3,
        tier: "B",
        description: "차원의 조각 집중 패키지.",
        contents: {
            dimension_fragment: 2500,
            time_scroll: 50,
            silver_key: 1
        }
    },
    {
        id: "ruby_bomb",
        name: "루비 폭탄 상자",
        price: 16000,
        count: 3,
        tier: "A",
        description: "루비와 어빌리티 포인트 수급에 적합.",
        contents: {
            ruby: 5000000,
            ap: 5000000,
            time_scroll: 15,
            silver_key: 1
        }
    },
    {
        id: "wizard_full",
        name: "마법사 패키지 (전체 구매)",
        type: "stepup",
        tier: "A",
        description: "초보~마스터 마법사 패키지 합계. 각종 확률 버프 포함.",
        subPackages: [
            { id: "wizard_novice", name: "초보 마법사", price: 11000, count: 1, contents: { ruby: 110000, dungeon_key: 130, magic: 10000, golden_key: 1 } },
            { id: "wizard_inter", name: "중급 마법사", price: 33000, count: 1, contents: { ruby: 330000, dungeon_key: 440, dimension_fragment: 700, magic: 30000, golden_key: 2 } },
            { id: "wizard_adv", name: "상급 마법사", price: 55000, count: 1, contents: { ruby: 550000, dungeon_key: 700, dimension_fragment: 1100, magic: 60000, golden_key: 3 } },
            { id: "wizard_master", name: "마스터 마법사", price: 110000, count: 1, contents: { ruby: 1100000, dungeon_key: 1650, dimension_fragment: 2500, magic: 150000, golden_key: 5 } }
        ]
    },
    {
        id: "costume_pkg",
        name: "코스튬 패키지 (10회)",
        price: 55000,
        count: 10,
        tier: "B",
        description: "정령의 성장 상자 50개 포함 (각 상자: 던열15, 차열10, 심층15, 시간5). 루비 페이백 별도.",
        contents: {
            ruby: 550000,
            ap: 15000000,
            golden_key: 3,
            dungeon_key: 750,      // 15 * 50
            dimension_key: 500,    // 10 * 50
            abyss_scroll: 750,     // 15 * 50
            time_scroll: 500       // 250 + (5 * 50)
        }
    },
    {
        id: "chloe_full",
        name: "클로에 스텝업 (전체 구매)",
        type: "stepup",
        tier: "S",
        description: "클로에 1차~4차 및 보너스까지 모두 획득 시 총합.",
        // Parent contents/price will be calculated automatically in main.js
        subPackages: [
            {
                id: "chloe_1",
                name: "클로에 1차",
                price: 3300,
                count: 2, // Must buy 2 times
                contents: {
                    ruby: 33000,
                    dungeon_key: 50,
                    dimension_key: 2500,
                    magic: 10000,
                    time_scroll: 15,
                    silver_key: 1
                }
            },
            {
                id: "chloe_2",
                name: "클로에 2차",
                price: 5500,
                count: 2,
                contents: {
                    ruby: 55000,
                    dungeon_key: 70,
                    dimension_key: 5000,
                    ap: 5000000,
                    time_scroll: 25,
                    silver_key: 2
                }
            },
            {
                id: "chloe_3",
                name: "클로에 3차",
                price: 11000,
                count: 2,
                contents: {
                    ruby: 110000,
                    dungeon_key: 130,
                    exploration_key: 130,
                    dimension_fragment: 220,
                    time_scroll: 50,
                    silver_key: 3
                }
            },
            {
                id: "chloe_4",
                name: "클로에 4차",
                price: 22000,
                count: 2,
                contents: {
                    ruby: 220000,
                    dungeon_key: 280,
                    exploration_key: 280,
                    dimension_fragment: 450,
                    time_scroll: 100,
                    silver_key: 5
                }
            },
            {
                id: "chloe_bonus",
                name: "클로에 보너스",
                price: 0,
                count: 1, // Bonus is 1 time
                contents: {
                    ruby: 549900,
                    top_amulet: 3,
                    dungeon_key: 700,
                    dimension_fragment: 1400,
                    magic: 33000,
                    golden_key: 2
                }
            }
        ]
    }
];
