// Number Formatter (e.g. 10000 -> 1만, 1500 -> 1,500)
function formatNumber(num) {
    if (Math.abs(num) >= 100000000) {
        return (num / 100000000).toFixed(1).replace(/\.0$/, '') + '억';
    }
    if (Math.abs(num) >= 10000) {
        return (num / 10000).toFixed(1).replace(/\.0$/, '') + '만';
    }
    return num.toLocaleString();
}

function formatPrice(price) {
    return price.toLocaleString() + '원';
}

// Calculate Step-up Totals (Recursively if needed, but 1-level deep is enough here)
function preProcessPackages(pkgs) {
    pkgs.forEach(pkg => {
        // Calculate Value Score
        // Assuming Ruby efficiency: Ruby amount / Price. If Ruby is 0, use arbitrary base?
        // Let's implement a simple efficiency metric: (Ruby + AP/10) / Price for now, or just placeholder.

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
            pkg.calculated = true;
        }

        // Calculate Value Score based on Price vs Ruby
        // If price is 0 (bonus), score is infinite/high
        if (pkg.price === 0) {
            pkg.valueScore = 999999;
        } else {
            const rubies = pkg.contents.ruby || 0;
            if (rubies > 0) {
                pkg.valueScore = Math.floor(rubies / pkg.price * 100); // Ruby per 100 Won
            } else {
                pkg.valueScore = 0; // Or based on other items?
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#package-table tbody');
    const ctx = document.getElementById('efficiencyChart').getContext('2d');

    if (!packages || packages.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No packages available.</td></tr>';
        return;
    }

    // Pre-process Data (Sums for Step-ups)
    preProcessPackages(packages);

    // Sort packages by Tier (S > A > B > C)
    const tierOrder = { 'S': 4, 'A': 3, 'B': 2, 'C': 1 };
    const sortedPackages = [...packages].sort((a, b) => {
        // Handle undefined tiers
        const tierA = a.tier ? tierOrder[a.tier] || 0 : 0;
        const tierB = b.tier ? tierOrder[b.tier] || 0 : 0;
        return tierB - tierA;
    });

    function createRow(pkg, isSubPackage = false) {
        const row = document.createElement('tr');

        // Extract Ruby and AP specifically
        const rubyVal = pkg.contents.ruby ? formatNumber(pkg.contents.ruby) : '-';
        const apVal = pkg.contents.ap ? formatNumber(pkg.contents.ap) : '-';

        // Generate "Others" list
        let othersList = [];
        for (const [key, val] of Object.entries(pkg.contents)) {
            if (key !== 'ruby' && key !== 'ap') {
                const name = RESOURCE_NAMES[key] || key;
                othersList.push(`${name} ${formatNumber(val)}`);
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
            row.classList.add(`parent-${pkg.parentId}`); // Helper class to find correct rows
            row.style.display = 'none'; // Hidden by default
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

    // Render Table
    sortedPackages.forEach(pkg => {
        // Render Main Row
        const mainRow = createRow(pkg);
        tableBody.appendChild(mainRow);

        // Render Sub Packages if any
        if (pkg.type === 'stepup' && pkg.subPackages) {
            pkg.subPackages.forEach(sub => {
                // Pass parent ID to sub package for linking
                sub.parentId = pkg.id;
                // Sub packages usually don't have tiers, inherit or leave blank? Leave blank.
                // Sub packages value score might be irrelevant or needs calc.
                // Re-calculate individual sub-package value score for display?
                if (sub.contents && sub.price) {
                    const rubies = sub.contents.ruby || 0;
                    if (rubies > 0) sub.valueScore = Math.floor(rubies / sub.price * 100);
                }

                const subRow = createRow(sub, true);
                tableBody.appendChild(subRow);
            });
        }
    });

    // Global toggle function
    window.toggleSubRows = (parentId) => {
        const subRows = document.querySelectorAll(`.parent-${parentId}`);
        subRows.forEach(row => {
            if (row.style.display === 'none') {
                row.style.display = 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    };

    // Render Chart
    const chartPackages = sortedPackages.filter(p => p.valueScore && p.valueScore < 900000); // Filter out infinite/bonus

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartPackages.map(pkg => pkg.name),
            datasets: [{
                label: '루비 효율 (100원당 루비)',
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
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: '패키지 효율 비교 (100원당 루비)',
                    color: '#f8fafc',
                    font: {
                        size: 16,
                        family: 'Outfit'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#f8fafc',
                        font: {
                            family: 'Outfit'
                        }
                    }
                }
            }
        }
    });
});
