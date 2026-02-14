// Utility to safe-guard against missing objects
const getValSafe = (obj, key) => (obj && obj[key]) ? obj[key] : 0;

// Use RESOURCE_NAMES from data.js or fallback
const NAMES = (typeof RESOURCE_NAMES !== 'undefined') ? RESOURCE_NAMES : {
    ruby: "루비",
    ap: "어빌리티 포인트",
    magic: "마법",
    dimension_key: "차원의 열쇠",
    dungeon_key: "던전 열쇠",
    exploration_key: "탐험 열쇠",
    dimension_fragment: "차원의 조각",
    abyss_scroll: "심층 스크롤",
    top_amulet: "최상급 아뮬렛",
    mystery_crystal: "신비한 차원의 결정",
    time_scroll: "시간 스크롤"
};

const SILVER_KEY_REWARDS = {
    dungeon_key: 10,
    exploration_key: 10,
    dimension_fragment: 30
};

const GOLDEN_KEY_FIXED = {
    ruby: 1000000,
    ap: 500000
};

const GOLDEN_KEY_CHOICES = {
    dungeon_key: { dungeon_key: 160 },
    dimension_fragment: { dimension_fragment: 300 },
    exploration_key: { exploration_key: 160 },
    ruby: { ruby: 2000000 }
};

const CONVERSION_RATES = {
    ap: 7500 / 5500,       // 5500 어빌포 = 7500 루비 가치 (1 어빌포당 약 1.36)
    magic: 2500 / 10       // 10개 마법 = 2500 루비 가치 (1개당 250)
};

var currentGoldenKeyChoice = 'dungeon_key';
var shouldConvertAp = false;
var shouldConvertMagic = false;
var shouldEfficiencyMode = false;

function getEffectiveContents(contents) {
    if (!contents) return {};
    let effective = { ...contents };

    // Convert Silver Keys
    if (contents.silver_key) {
        const count = contents.silver_key;
        for (const [key, val] of Object.entries(SILVER_KEY_REWARDS)) {
            effective[key] = (effective[key] || 0) + (val * count);
        }
        delete effective.silver_key;
    }

    // Convert Golden Keys
    if (contents.golden_key) {
        const count = contents.golden_key;
        for (const [key, val] of Object.entries(GOLDEN_KEY_FIXED)) {
            effective[key] = (effective[key] || 0) + (val * count);
        }
        const choiceRewards = GOLDEN_KEY_CHOICES[currentGoldenKeyChoice];
        if (choiceRewards) {
            for (const [key, val] of Object.entries(choiceRewards)) {
                effective[key] = (effective[key] || 0) + (val * count);
            }
        }
        delete effective.golden_key;
    }

    return effective;
}

function getCombinedRubyContents(contents) {
    let effective = getEffectiveContents(contents);
    let extraRuby = 0;

    if (shouldConvertAp && effective.ap) {
        extraRuby += effective.ap * CONVERSION_RATES.ap;
        effective.ap = 0;
    }
    if (shouldConvertMagic && effective.magic) {
        extraRuby += effective.magic * CONVERSION_RATES.magic;
        effective.magic = 0;
    }

    if (extraRuby > 0) {
        effective.ruby = (effective.ruby || 0) + extraRuby;
    }

    return effective;
}

function preProcessPackages(pkgs) {
    if (!pkgs || !Array.isArray(pkgs)) return;
    pkgs.forEach(pkg => {
        if (pkg.type === 'stepup' && pkg.subPackages) {
            let totalContents = {};
            let totalPrice = 0;

            pkg.subPackages.forEach(sub => {
                const count = sub.count || 1;
                totalPrice += (sub.price || 0) * count;
                if (sub.contents) {
                    for (const [key, val] of Object.entries(sub.contents)) {
                        totalContents[key] = (totalContents[key] || 0) + (val * count);
                    }
                }
            });
            pkg.contents = totalContents;
            pkg.price = totalPrice;
        }
    });
}

function formatNumberShort(num) {
    if (!num || num === 0) return '0';
    if (Math.abs(num) >= 10000) {
        const value = num / 10000;
        return value.toLocaleString('ko-KR', { maximumFractionDigits: 1 }) + '만';
    }
    return Math.round(num).toLocaleString('ko-KR');
}

function formatNumberExact(num) {
    if (!num) return '0';
    return Math.round(num).toLocaleString('ko-KR');
}

function formatPrice(num) {
    if (!num) return '0원';
    return num.toLocaleString('ko-KR') + '원';
}

var efficiencyChart = null;
var currentSort = { key: 'tier', direction: 'desc' };

function updateHeaderUI() {
    document.querySelectorAll('th.sortable').forEach(th => {
        const key = th.getAttribute('data-sort');
        th.classList.remove('active-sort', 'asc', 'desc');

        let label = th.getAttribute('data-label');
        if (!label) {
            label = th.textContent.replace(/[↕↑↓]/g, '').trim();
            th.setAttribute('data-label', label);
        }

        if (key === currentSort.key) {
            th.classList.add('active-sort', currentSort.direction);
            th.innerHTML = `${label} ${currentSort.direction === 'asc' ? '↑' : '↓'}`;
        } else {
            th.innerHTML = `${label} ↕`;
        }
    });
}

function createRow(pkg, isSubPackage = false) {
    const row = document.createElement('tr');
    const effectiveDisplay = getCombinedRubyContents(pkg.contents);

    const getVal = (key, baseObj) => {
        let val = baseObj[key] || 0;
        if (shouldEfficiencyMode && pkg.price > 0) {
            val = (val / pkg.price) * 10000;
        }
        return val;
    };

    const importantKeys = [
        'ruby', 'ap', 'magic', 'dungeon_key', 'dimension_key',
        'dimension_fragment', 'exploration_key', 'abyss_scroll',
        'top_amulet', 'mystery_crystal', 'time_scroll'
    ];

    let resColsHtml = '';
    importantKeys.forEach(key => {
        const val = getVal(key, effectiveDisplay);
        let formatted;
        if (key === 'magic') {
            formatted = val ? formatNumberExact(val) : '-';
        } else {
            formatted = val ? (['ruby', 'ap', 'dimension_key'].includes(key) ? formatNumberShort(val) : formatNumberExact(val)) : '-';
        }
        resColsHtml += `<td class="col-res res-${key}">${formatted}</td>`;
    });

    let othersList = [];
    for (const [key, val] of Object.entries(effectiveDisplay)) {
        if (!importantKeys.includes(key) && val > 0) {
            const name = NAMES[key] || key;
            const formattedVal = (key === 'magic_stone') ? formatNumberShort(val) : formatNumberExact(val);
            othersList.push(`${name} ${formattedVal}`);
        }
    }
    const otherItemsHtml = othersList.length > 0
        ? `<ul>${othersList.map(item => `<li>${item}</li>`).join('')}</ul>`
        : '-';

    let nameHtml = pkg.name || '알 수 없는 패키지';
    if (pkg.type === 'stepup' && pkg.subPackages) {
        nameHtml = `<span class="toggle-icon" onclick="toggleSubRows('${pkg.id}')">▼</span> ${nameHtml}`;
        row.classList.add('stepup-parent');
    }
    if (isSubPackage) {
        row.classList.add('sub-package', `parent-${pkg.parentId}`);
        row.style.display = 'none';
        nameHtml = `<span style="padding-left: 20px;">└ ${nameHtml}</span>`;
    }

    const tierDisplay = pkg.tier || '-';
    const tierTooltipHtml = pkg.tierTooltip
        ? `<div class="tier-with-tooltip tier-${tierDisplay}">${tierDisplay}<span class="tooltip-trigger">?</span><span class="tier-tooltip-text">${pkg.tierTooltip}</span></div>`
        : `<span class="tier-${tierDisplay}">${tierDisplay}</span>`;

    const countDisplay = isSubPackage ? pkg.count + '회' : (pkg.count ? pkg.count + '회' : '-');

    row.innerHTML = `
        <td class="col-tier">${tierTooltipHtml}</td>
        <td class="col-name">${nameHtml}</td>
        <td class="col-price">${formatPrice(pkg.price)}</td>
        <td class="col-limit">${countDisplay}</td>
        ${resColsHtml}
        <td class="col-other">${otherItemsHtml}</td>
        <td class="col-desc">${pkg.description || '-'}</td>
    `;
    return row;
}

function renderChart(sortedPackages) {
    const canvas = document.getElementById('efficiencyChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. Determine which field to use for the chart
    // If sorted by a resource, use that. Otherwise, default to dungeon_key.
    const resourceKeys = ['ruby', 'ap', 'magic', 'dimension_key', 'dungeon_key', 'exploration_key', 'dimension_fragment', 'abyss_scroll', 'top_amulet', 'mystery_crystal', 'time_scroll'];
    let chartField = resourceKeys.includes(currentSort.key) ? currentSort.key : 'dungeon_key';
    const fieldName = NAMES[chartField] || chartField;

    // 2. Filter top 15 packages that have data for the chosen field
    const chartPackages = sortedPackages.filter(p => {
        const eff = getCombinedRubyContents(p.contents);
        return (eff[chartField] || 0) > 0;
    }).slice(0, 15);

    const getChartValue = (pkg) => {
        let val = getCombinedRubyContents(pkg.contents)[chartField] || 0;
        if (shouldEfficiencyMode && pkg.price > 0) {
            val = (val / pkg.price) * 10000;
        }
        return val;
    };

    if (efficiencyChart) efficiencyChart.destroy();

    const chartLabel = shouldEfficiencyMode ? `${fieldName} (1만 원 효율)` : `${fieldName} (총 수량)`;

    efficiencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartPackages.map(pkg => pkg.name),
            datasets: [{
                label: chartLabel,
                data: chartPackages.map(pkg => getChartValue(pkg)),
                backgroundColor: chartPackages.map(pkg => {
                    switch (pkg.tier) {
                        case 'SSS': return 'rgba(255, 77, 77, 0.7)';
                        case 'SS': return 'rgba(0, 210, 255, 0.7)';
                        case 'S': return 'rgba(245, 158, 11, 0.7)';
                        case 'A': return 'rgba(168, 85, 247, 0.7)';
                        case 'B': return 'rgba(59, 130, 246, 0.7)';
                        case 'C': return 'rgba(16, 185, 129, 0.7)';
                        case 'D': return 'rgba(100, 116, 139, 0.7)';
                        default: return 'rgba(148, 163, 184, 0.7)';
                    }
                })
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: {
                        color: '#94a3b8',
                        callback: function (value) {
                            if (value >= 10000) return (value / 10000) + '만';
                            return value.toLocaleString();
                        }
                    }
                },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#f8fafc', font: { weight: 'bold' } }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let val = context.parsed.y;
                            return context.dataset.label + ': ' + (val >= 10000 ? (val / 10000).toLocaleString() + '만' : Math.round(val).toLocaleString());
                        }
                    }
                }
            }
        }
    });
}

function renderAll() {
    if (typeof packages === 'undefined') {
        console.error('Packages data not found!');
        return;
    }

    updateHeaderUI();
    const tableBody = document.querySelector('#package-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const tierOrder = { 'SSS': 7, 'SS': 6, 'S': 5, 'A': 4, 'B': 3, 'C': 2, 'D': 1 };

    const sortedPackages = [...packages].sort((a, b) => {
        let valA, valB;

        if (currentSort.key === 'tier') {
            valA = a.tier ? tierOrder[a.tier] || 0 : 0;
            valB = b.tier ? tierOrder[b.tier] || 0 : 0;
        } else if (currentSort.key === 'price') {
            valA = a.price || 0;
            valB = b.price || 0;
        } else {
            const effA = getCombinedRubyContents(a.contents);
            const effB = getCombinedRubyContents(b.contents);
            valA = effA[currentSort.key] || 0;
            valB = effB[currentSort.key] || 0;

            if (shouldEfficiencyMode) {
                if (a.price > 0) valA = valA / a.price;
                if (b.price > 0) valB = valB / b.price;
            }
        }

        if (currentSort.direction === 'asc') return valA - valB;
        return valB - valA;
    });

    sortedPackages.forEach((pkg) => {
        tableBody.appendChild(createRow(pkg));
        if (pkg.type === 'stepup' && pkg.subPackages) {
            pkg.subPackages.forEach(sub => {
                tableBody.appendChild(createRow({ ...sub, parentId: pkg.id, isSubPackage: true }, true));
            });
        }
    });

    renderChart(sortedPackages);
}

function updateValueScoresAndRender() {
    renderAll();
}

// Global toggle sub rows
window.toggleSubRows = (parentId) => {
    const subRows = document.querySelectorAll(`.parent-${parentId}`);
    subRows.forEach(row => {
        row.style.display = (row.style.display === 'none') ? 'table-row' : 'none';
    });
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof packages !== 'undefined') {
        preProcessPackages(packages);
        updateValueScoresAndRender();
    }

    document.querySelectorAll('input[name="key-choice"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentGoldenKeyChoice = e.target.value;
            updateValueScoresAndRender();
        });
    });

    const apToggle = document.getElementById('convert-ap-toggle');
    if (apToggle) {
        apToggle.addEventListener('change', (e) => {
            shouldConvertAp = e.target.checked;
            updateValueScoresAndRender();
        });
    }

    const magicToggle = document.getElementById('convert-magic-toggle');
    if (magicToggle) {
        magicToggle.addEventListener('change', (e) => {
            shouldConvertMagic = e.target.checked;
            updateValueScoresAndRender();
        });
    }

    const efficiencyToggle = document.getElementById('efficiency-mode-toggle');
    if (efficiencyToggle) {
        efficiencyToggle.addEventListener('change', (e) => {
            shouldEfficiencyMode = e.target.checked;
            updateValueScoresAndRender();
        });
    }

    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.getAttribute('data-sort');
            if (currentSort.key === key) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.key = key;
                currentSort.direction = 'desc';
            }
            renderAll();
        });
    });

    const captureBtn = document.getElementById('capture-btn');
    if (captureBtn) {
        captureBtn.addEventListener('click', captureTable);
    }
});

function captureTable() {
    const btn = document.getElementById('capture-btn');
    const captureArea = document.getElementById('capture-area');
    const container = document.querySelector('.table-container');
    const table = document.querySelector('table');

    // UI feedback
    const originalText = btn.innerHTML;
    btn.innerHTML = "⌛ 전체 캡처 중...";
    btn.disabled = true;

    // Temporary style changes
    const originalMaxHeight = container.style.maxHeight;
    const originalOverflowY = container.style.overflowY;
    const originalTableMinWidth = table.style.minWidth;

    // Disable sticky for capture
    const stickyHeader = document.querySelector('.top-sticky-container');
    const originalStickyPos = stickyHeader ? stickyHeader.style.position : '';
    if (stickyHeader) stickyHeader.style.position = 'static';

    const stickyCells = document.querySelectorAll('th');
    const originalStickyPositions = [];
    stickyCells.forEach(cell => {
        originalStickyPositions.push(cell.style.position);
        cell.style.position = 'static';
    });

    // Expand to full content
    container.style.maxHeight = 'none';
    container.style.overflowY = 'visible';
    table.style.minWidth = '1800px';

    setTimeout(() => {
        html2canvas(captureArea, {
            backgroundColor: "#0f172a",
            scale: 2,
            useCORS: true,
            logging: false,
            width: captureArea.scrollWidth,
            height: captureArea.scrollHeight,
            windowWidth: captureArea.scrollWidth,
            windowHeight: captureArea.scrollHeight
        }).then(canvas => {
            const link = document.createElement('a');
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            link.download = `magic_package_full_${dateStr}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            // Revert
            container.style.maxHeight = originalMaxHeight;
            container.style.overflowY = originalOverflowY;
            table.style.minWidth = originalTableMinWidth;
            if (stickyHeader) stickyHeader.style.position = originalStickyPos;
            stickyCells.forEach((cell, i) => {
                cell.style.position = originalStickyPositions[i];
            });
            btn.innerHTML = originalText;
            btn.disabled = false;
        }).catch(err => {
            console.error("Capture failed:", err);
            container.style.maxHeight = originalMaxHeight;
            container.style.overflowY = originalOverflowY;
            table.style.minWidth = originalTableMinWidth;
            if (stickyHeader) stickyHeader.style.position = originalStickyPos;
            stickyCells.forEach((cell, i) => {
                cell.style.position = originalStickyPositions[i];
            });
            btn.innerHTML = "❌ 오류 발생";
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        });
    }, 300);
}
