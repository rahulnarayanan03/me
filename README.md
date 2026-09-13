# Rahul Narayanan Portfolio

Responsive static engineering portfolio built with plain HTML, CSS and JavaScript.

## Included

- Main portfolio page and five project cards on the main page
- Tighter landing-page positioning with the main content moved closer to the top navigation
- Professional heading, role target and stronger evidence from engineering work
- Prominent Optik internship achievement and expanded engineering experience
- Pavement Management Services experience added from the latest resume
- Osprey Chess Engine added as a full case study
- More readable project technology stacks and evidence-led project cards
- Clearer liquid-glass interface with more transparency, sharper highlights and reduced acrylic-style tint
- Floating navigation with a static glass shell and hover feedback limited to clickable controls
- Dark and light themes
- Responsive mobile navigation
- Scroll reveal animations and reduced-motion support
- Full-card project navigation and keyboard controls
- Current resume PDF

## Deploy to GitHub Pages

1. Create a new repository on GitHub and push everything in this folder to it (this `index.html` needs to sit at the repo root, not inside a subfolder).
2. In the repo, go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, pick the `main` branch and the `/ (root)` folder, then save.
4. GitHub will publish the site at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

If you'd rather it live at `https://<your-username>.github.io/` directly, name the repository `<your-username>.github.io` instead.

## Preview locally

Open `index.html` directly, or run a local server from this folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Content to update later

- Add final performance results to the cooling-cart case study after capstone testing is complete.
- Add project photographs, screenshots or videos when suitable public material is available.
- Add links to public GitHub repositories where project code can be shared.

## Clean-up pass

- Primary navigation simplified to: About, Projects, Experience, Education, Skills, Resume, Contact.
- The Engineering Approach section remains part of the page, but sits directly after About rather than competing for a top-navigation slot.
- Homepage section order now follows the navigation order.
- Header spacing and desktop navigation have been tightened, with the mobile menu activating earlier on medium-width laptops to prevent crowding.
- Section spacing and card hover movement have been slightly reduced for a calmer, more consistent layout.


## Clean-up v2
- Hero now appears before the metrics strip in the homepage HTML.
- Primary section order follows the navigation order.
- Active navigation items no longer receive a second hover glass layer.
- Top-of-page spacing was retuned for the new order.

## Clean-up v4
- Reduced vertical spacing between major sections for a denser, more continuous page.
- Updated the hero/title wording to **Mechatronics Engineer** while retaining the official degree title **Mechatronic Engineering** where applicable.
- Folded the former standalone **How I work** section into **About** and removed redundant degree/status tiles.
- Removed the standalone **Education** section and its navigation item; education remains available inside the full resume section.
- Reworked the Contact secondary buttons with a blue-tinted glass treatment instead of grey.

## Clean-up v5
- Tightened the desktop hero grid and reduced the display-title size so **Mechatronics Engineer** no longer crowds or runs underneath the Engineering Snapshot panel.
- Removed the **How I work** eyebrow while keeping the systems-thinking content inside About.
- Reduced major-section vertical padding to 20px and tightened heading/metrics spacing for a more continuous page flow.
- Replaced the remaining grey hero/contact secondary buttons with a blue glass treatment derived from the existing interface palette.

### v6 visual refinement
- Replaced the remaining neutral grey secondary buttons with blue glass variants from the site's existing UI palette, including View resume, Download PDF, LinkedIn, GitHub and Resume.

- The navigation brand mark uses the same SVG as the browser favicon for consistent identity.
