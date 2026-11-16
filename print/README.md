# Print files

Ready for the print shop: `out/*.pdf` (fonts embedded, 3 mm bleed on stands/poster, 2 mm on the card).
`out/*.png` are 300 dpi previews.

| File | Size | For |
|---|---|---|
| stand-A5-pharmacy | A5 148×210 mm | Pharmacy counter |
| stand-A5-doctor | A5 | Doctor's office / reception |
| stand-A5-clinic | A5 | Clinic, hospital pharmacy, patient companions |
| stand-A5-elderly | A5 | Elderly care homes, home-care services |
| poster-A4-waiting-room | A4 210×297 mm | Waiting-room wall |
| card-90x50 | 90×50 mm | Hand out with prescriptions |
| qr-sticker-10cm-* | 100×100 mm | Desk QR sticker, one per venue (pharmacy, doctor, clinic, elderly) |

To change wording or add a place, edit `VENUES` in `build.js`, then run `node print/build.js` from the repo root.
