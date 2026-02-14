// Number Formatter (Shortened for specific resources: 10000 -> 1만)
function formatNumberShort(num) {
    if (Math.abs(num) >= 100000000) {
        return (num / 100000000).toFixed(1).replace(/\.0$/, '') + '억';
    }
    if (Math.abs(num) >= 10000) {
        return (num / 10000).toFixed(1).replace(/\.0$/, '') + '만';
    }
    return num.toLocaleString();
}

// Exact Formatter (e.g. 15000 -> 15,000)
function formatNumberExact(num) {
    return num.toLocaleString();
}

function formatPrice(price) {
    return price.toLocaleString() + '원';
}

// Key Conversion Constants
const SILVER_KEY_REWARDS = {
    ruby: 60000,
    dungeon_key: 12,
    abyss_scroll: 10,
    mystery_crystal: 1
};

const GOLDEN_KEY_FIXED = {
    ruby: 600000,
    abyss_scroll: 100,
    mystery_crystal: 10,
    time_scroll: 20
};

const GOLDEN_KEY_CHOICES = {
    dungeon_key: { dungeon_key: 160 },
    dimension_fragment: { dimension_fragment: 300 },
    exploration_key: { exploration_key: 160 },
    ruby: { ruby: 2000000 }
};

let currentGoldenKeyChoice = 'dungeon_key';

function getEffectiveContents(contents) {
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
        // Fixed rewards
        for (const [key, val] of Object.entries(GOLDEN_KEY_FIXED)) {
            effective[key] = (effective[key] || 0) + (val * count);
        }
        // Choice rewards
        const choiceRewards = GOLDEN_KEY_CHOICES[currentGoldenKeyChoice];
        for (const [key, val] of Object.entries(choiceRewards)) {
            effective[key] = (effective[key] || 0) + (val * count);
        }
        delete effective.golden_key;
    }

    return effective;
}

// Calculate Step-up Totals (Recursively if needed, but 1-level deep is enough here)
function preProcessPackages(pkgs) {
    pkgs.forEach(pkg => {
        if (pkg.type === 'stepup' && pkg.subPackages) {
            let totalContents = {};
            let totalPrice = 0;

            pkg.subPackages.forEach(sub => {
                const count = sub.count || 1;
                totalPrice += sub.price * count;

                // Sum contents
                if (sub.contents) {
                    for (const [key, val] of Object.entries(sub.contents)) {
                        totalContents[key] = (totalContents[key] || 0) + (val * count);
                    }
                }
            });

            pkg.contents = totalContents;
            pkg.price = totalPrice;
            pkg.calculatedBySub = true; // Use different flag to avoid re-summing on re-render
        }
    });
}

function updateValueScoresAndRender() {
    packages.forEach(pkg => {
        const effective = getEffectiveContents(pkg.contents);

        if (pkg.price === 0) {
            pkg.valueScore = 999999;
        } else {
            const rubies = effective.ruby || 0;
            if (rubies > 0) {
                pkg.valueScore = Math.floor(rubies / pkg.price * 100);
            } else {
                pkg.valueScore = 0;
            }
        }

        // Apply same for sub packages
        if (pkg.subPackages) {
            pkg.subPackages.forEach(sub => {
                const subEffective = getEffectiveContents(sub.contents);
                if (sub.price === 0) {
                    sub.valueScore = 999999;
                } else if (subEffective.ruby > 0) {
                    sub.valueScore = Math.floor(subEffective.ruby / sub.price * 100);
                } else {
                    sub.valueScore = 0;
                }
            });
        }
    });

    renderAll();
}

let efficiencyChart = null;

function renderAll() {
    const tableBody = document.querySelector('#package-table tbody');
    tableBody.innerHTML = '';

    // Sort packages by tier
    const tierOrder = { 'S': 4, 'A': 3, 'B': 2, 'C': 1 };
    const sortedPackages = [...packages].sort((a, b) => {
        const tierA = a.tier ? tierOrder[a.tier] || 0 : 0;
        const tierB = b.tier ? tierOrder[b.tier] || 0 : 0;
        return tierB - tierA;
    });

    sortedPackages.forEach(pkg => {
        const mainRow = createRow(pkg);
        tableBody.appendChild(mainRow);

        if (pkg.type === 'stepup' && pkg.subPackages) {
            pkg.subPackages.forEach(sub => {
                sub.parentId = pkg.id;
                const subRow = createRow(sub, true);
                tableBody.appendChild(subRow);
            });
        }
    });

    renderChart(sortedPackages);
}

function createRow(pkg, isSubPackage = false) {
    const row = document.createElement('tr');

    // Use EFFECTIVE contents for display
    const effective = getEffectiveContents(pkg.contents);

    const rubyVal = effective.ruby ? formatNumberShort(effective.ruby) : '-';
    const apVal = effective.ap ? formatNumberShort(effective.ap) : '-';

    let othersList = [];
    for (const [key, val] of Object.entries(effective)) {
        if (key !== 'ruby' && key !== 'ap') {
            const name = RESOURCE_NAMES[key] || key;
            const formattedVal = (key === 'magic_stone')
                ? formatNumberShort(val)
                : formatNumberExact(val);
            othersList.push(`${name} ${formattedVal}`);
        }
    }

    const otherItemsHtml = othersList.length > 0
        ? `<ul>${othersList.map(item => `<li>${item}</li>`).join('')}</ul>`
        : '-';

    let nameHtml = pkg.name;
    let expandBtn = '';

    if (pkg.type === 'stepup' && pkg.subPackages) {
        expandBtn = `<button class="toggle-btn" onclick="toggleSubRows('${pkg.id}')">▼</button> `;
        nameHtml = expandBtn + pkg.name;
        row.classList.add('stepup-parent');
    }

    if (isSubPackage) {
        row.classList.add('sub-package');
        row.classList.add(`parent-${pkg.parentId}`);
        row.style.display = 'none';
        nameHtml = `<span style="padding-left: 20px;">└ ${pkg.name}</span>`;
    }

    const countDisplay = isSubPackage ? pkg.count + '회' : (pkg.count ? pkg.count + '회' : '-');

    row.innerHTML = `
        <td class="col-tier tier-${pkg.tier || ''}">${pkg.tier || '-'}</td>
        <td class="col-name">${nameHtml}</td>
        <td class="col-price">${formatPrice(pkg.price)}</td>
        <td class="col-limit">${countDisplay}</td>
        <td class="col-score">${pkg.valueScore ? pkg.valueScore.toLocaleString() : '-'}</td>
        <td class="col-gems">${rubyVal}</td>
        <td class="col-gold">${apVal}</td>
        <td class="col-other">${otherItemsHtml}</td>
        <td class="col-desc">${pkg.description || '-'}</td>
    `;
    return row;
}

function renderChart(sortedPackages) {
    const ctx = document.getElementById('efficiencyChart').getContext('2d');
    const chartPackages = sortedPackages.filter(p => p.valueScore && p.valueScore < 900000);

    if (efficiencyChart) {
        efficiencyChart.destroy();
    }

    efficiencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartPackages.map(pkg => pkg.name),
            datasets: [{
                label: '루비 효율 (환산 포함)',
                data: chartPackages.map(pkg => pkg.valueScore),
                backgroundColor: chartPackages.map(pkg => {
                    switch (pkg.tier) {
                        case 'S': return 'rgba(245, 158, 11, 0.7)';
                        case 'A': return 'rgba(168, 85, 247, 0.7)';
                        case 'B': return 'rgba(59, 130, 246, 0.7)';
                        case 'C': return 'rgba(16, 185, 129, 0.7)';
                        default: return 'rgba(148, 163, 184, 0.7)';
                    }
                }),
                borderColor: chartPackages.map(pkg => {
                    switch (pkg.tier) {
                        case 'S': return '#f59e0b';
                        case 'A': return '#a855f7';
                        case 'B': return '#3b82f6';
                        case 'C': return '#10b981';
                        default: return '#94a3b8';
                    }
                }),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: '패키지 효율 비교 (100원당 루비 환산 가치)',
                    color: '#f8fafc',
                    font: { size: 16, family: 'Outfit' }
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#f8fafc', font: { family: 'Outfit' } } }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial Pre-process
    preProcessPackages(packages);

    // Initial Render
    updateValueScoresAndRender();

    // Listen for toggle changes
    document.querySelectorAll('input[name="key-choice"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentGoldenKeyChoice = e.target.value;
            updateValueScoresAndRender();
        });
    });

    // Global toggle sub rows
    window.toggleSubRows = (parentId) => {
        const subRows = document.querySelectorAll(`.parent-${parentId}`);
        subRows.forEach(row => {
            row.style.display = (row.style.display === 'none') ? 'table-row' : 'none';
        });
    };
});
