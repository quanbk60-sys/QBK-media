
# Ghi chú họa sĩ: nhân vật con vật (10/11/2026)
- **Viết bộ vẽ riêng** `studio/engine/lib/animals.mjs` thay vì thêm vào `character.mjs`: người que có đầu 100px, thân elip dài và chân dài 330px, không hợp thân chibi đầu to 118px, chân ngắn, áo dài tay rộng, mõm dài. Vẫn **tái dùng** hệ tư thế (các góc `fu ff bu bf ft fk bt bk lean nod lie bob`), `applyCycle` và bảng `EXPR`, nên scene.json gọi giống người que, chỉ thêm `"species"` ở `cast`.
- Thêm vào `character.mjs` (không đổi tên cũ): pose `sit`, `lounge`; expr `cry`, `laugh`, `dazed`, `proud`, `fury`. Người que vẫn vẽ được chúng (kiểm bằng test).
- Phong cách: nét `#2A2723` 5,5 đến 6px, tô phẳng, bóng nhẹ bằng hình lưỡi liềm trong suốt (không dùng clip nên không tràn viền). Đốm lông Xúc Xích là elip đen, tô tay.
- Chưa ưng: (1) tay áo con vật khi buông xuôi trông hơi giống cái chuông, nằm đè lên cổ áo; (2) mèo và khỉ chưa có biểu cảm đặc sắc riêng ngoài bộ chung; (3) khoanh tay (`crossed`) với đầu to bị che nhiều; (4) chưa có ghế tre cho `lounge` (prop ghế sẽ làm khi vẽ bối cảnh); (5) mũi sưng hơi nhỏ so với ảnh mẫu, có thể phóng to nếu người dùng muốn.
