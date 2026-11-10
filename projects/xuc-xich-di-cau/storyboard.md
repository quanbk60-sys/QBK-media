# Xúc Xích đi câu: storyboard và prompt

Video hoạt hình 3D 9:16, khoảng 80 giây, gồm 10 cảnh, mỗi cảnh 8 giây (đúng độ dài một clip Veo).
Nhân vật chính là chú chó lạp xưởng trong `ref/nhan-vat-goc.png`. Truyện viết mới, nối tiếp tấm ảnh: chú chó từng bị cua kẹp mũi bên hồ.

**Cách làm từng cảnh**
1. Gửi GPT **prompt ảnh khung đầu** của cảnh, đính kèm `ref/nhan-vat-goc.png` (và các tờ nhân vật ở bước 0 khi đã có).
2. Gửi Gemini ảnh vừa tạo, kèm **prompt video** của cảnh, chế độ tạo từ ảnh (image-to-video), khung dọc 9:16.
3. Ghép 10 clip theo thứ tự. Chữ trên hình và lời dẫn để lúc dựng (có thể nhờ đoàn phim QBK làm phần này).

Prompt viết bằng tiếng Anh vì mô hình ảnh và video theo tiếng Anh sát hơn. Phần mô tả tiếng Việt để bạn đọc.

---

## Cốt truyện

**Xúc Xích**, chú chó lạp xưởng lông đốm, đi câu cá cùng anh Bin và chị Na ở cái hồ quen. Chú quyết câu được một con cá thật to để rửa mối nhục lần trước bị **Cua Đỏ** kẹp mũi. Cần câu kéo lên chỉ được chiếc ủng cũ, Cua Đỏ cười nhạo. Xúc Xích tức quá nhảy xuống hồ bắt cá bằng mồm, ngoạm trúng đuôi **Ông Chép**, con cá chép vàng khổng lồ, và bị kéo lướt khắp mặt hồ như trượt nước, làm cả nhà **Vịt Mẹ** chạy tán loạn. Ông Chép hất chú lên bờ, chú rơi đúng vào thùng mồi.

Nhân lúc đó Cua Đỏ lén đánh cắp hộp xúc xích của Xúc Xích. Hai đứa rượt nhau, Cua Đỏ lại kẹp mũi chú lần nữa. Xúc Xích hắt xì một cái thật mạnh, cua văng vào xô. Chú thắng rồi, nhưng nhìn con cua run rẩy, chú lại thả nó về hồ. Cảnh cuối lúc hoàng hôn: Cua Đỏ bò lên tặng chú một con cá nhỏ xíu. Hai kẻ thù thành bạn, mũi Xúc Xích vẫn còn đỏ.

**Thông điệp:** tử tế có khi được đáp lại bằng tình bạn. **Câu mở:** "Lần trước bị kẹp mũi, lần này Xúc Xích quay lại báo thù!"

---

## 0. Khóa phong cách và tờ nhân vật (làm trước)

### Khối phong cách: dán vào cuối MỌI prompt ảnh
```
STYLE: 3D animated feature-film look, Pixar-like stylized realism, soft global illumination, warm golden-hour sunlight, lush green lakeside with calm teal water, smooth rounded grey rocks and tall reeds, shallow depth of field, rich saturated but natural colors, vertical 9:16 composition, no text, no watermark. Keep every character identical to the reference images.
```

### Mô tả cố định từng nhân vật (đã chép sẵn vào từng prompt bên dưới)
| Nhân vật | Mô tả tiếng Anh |
|---|---|
| **Xúc Xích** (chính) | small dapple miniature dachshund, black and silver-grey spotted coat, tan markings on eyebrows, muzzle, chest and paws, long floppy spotted ears, big glossy brown eyes, black nose, red collar with a small gold bone-shaped tag |
| **Anh Bin** | young Asian man, short black hair, warm smile, plain grey t-shirt, dark blue jeans, dark sneakers |
| **Chị Na** | young Asian woman, chubby and cheerful, shoulder-length dark brown hair, clear round glasses, dusty-rose t-shirt, navy patterned shorts, green bracelets, brown sandals |
| **Cua Đỏ** | small glossy red-orange crab, tall stalk eyes with big black pupils, one claw slightly bigger than the other, mischievous expressive face |
| **Ông Chép** (mới) | huge golden-orange carp, big shiny scales, long droopy barbels like a moustache, heavy-lidded grumpy old-man expression |
| **Vịt Mẹ và 4 vịt con** (mới) | white mother duck with orange beak and a tiny blue head scarf, four fluffy yellow ducklings |
| **Ếch Cốm** (mới) | small bright green frog with huge eyes, sitting on a lily pad, wearing a tiny lotus-petal hat |

### Prompt 0A: tờ nhân vật Xúc Xích (đính kèm ảnh gốc)
```
Create a character turnaround sheet of the dachshund from the attached image, in the exact same 3D animated style. Show 4 views on a plain warm-grey background: front, side, back, three-quarter. Add 4 small expression heads: proud, curious, shocked, laughing. Character: small dapple miniature dachshund, black and silver-grey spotted coat, tan markings on eyebrows, muzzle, chest and paws, long floppy spotted ears, big glossy brown eyes, black nose, red collar with a small gold bone-shaped tag. Keep the markings and proportions identical to the reference. Horizontal 16:9, no text.
```

### Prompt 0B: tờ nhân vật phụ (đính kèm ảnh gốc)
```
Create a character lineup sheet in the exact same 3D animated style as the attached image, on a plain warm-grey background, all characters at correct relative scale next to the small dachshund for scale:
1) a small glossy red-orange crab, tall stalk eyes with big black pupils, one claw slightly bigger, mischievous face (same crab as the reference);
2) a huge golden-orange carp, big shiny scales, long droopy barbels like a moustache, heavy-lidded grumpy old-man expression, shown leaping out of water;
3) a white mother duck with orange beak and a tiny blue head scarf, with four fluffy yellow ducklings;
4) a small bright green frog with huge eyes, sitting on a lily pad, wearing a tiny lotus-petal hat.
Horizontal 16:9, no text.
```

### Khối dặn cho mọi prompt video Gemini (đã chép sẵn vào từng cảnh)
```
Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

---

## Cảnh 1: Lên đường (0:00–0:08)
**Nội dung:** Sáng sớm bên hồ. Anh Bin vác hai ghế xếp, chị Na xách giỏ đồ ăn. Xúc Xích đi đầu, đội mũ câu cá xanh bé xíu, ngậm cần câu đồ chơi, ngẩng cao đầu vênh váo.
**Chữ trên hình:** "Lần trước bị kẹp mũi… lần này quay lại báo thù!"

**Ảnh khung đầu (GPT):**
```
Wide shot on a dirt path beside a calm teal lake in early morning golden light. In front, the small dapple miniature dachshund (black and silver-grey spotted coat, tan markings, long floppy spotted ears, big brown eyes, red collar with gold bone tag) marches proudly with chin up, wearing a tiny green bucket fishing hat and carrying a small toy fishing rod in its mouth. Behind it walk a young Asian man (short black hair, grey t-shirt, dark jeans, sneakers) carrying two folding chairs, and a young chubby Asian woman (shoulder-length dark brown hair, clear round glasses, dusty-rose t-shirt, navy patterned shorts, green bracelets, sandals) carrying a picnic basket. Small wooden fishing dock visible ahead.
[STYLE block]
```
**Video (Gemini):**
```
The dachshund struts proudly toward the camera, chest puffed out, ears bouncing with every step, tiny fishing hat wobbling, toy rod held in its mouth. The couple follows smiling and chatting silently. Camera slowly tracks backward at dog's eye level, then gently tilts up to reveal the lake and wooden dock. Morning birdsong, soft footsteps on dirt, dog's collar tag jingling. Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

## Cảnh 2: Kẻ thù cũ (0:08–0:16)
**Nội dung:** Ngồi trên cầu gỗ, Xúc Xích nhìn chằm chằm phao câu. Sau tảng đá gần đó, Cua Đỏ thò mắt ra, giơ càng kẹp kẹp khiêu khích. Xúc Xích giật mình lấy chân che mũi, mắt nheo lại.
**Chữ trên hình:** "Lại là mày!"

**Ảnh khung đầu (GPT):**
```
Medium shot on a small wooden fishing dock over a teal lake. The small dapple miniature dachshund (black and silver-grey spotted coat, tan markings, long floppy spotted ears, big brown eyes, red collar with gold bone tag, tiny green fishing hat) sits at the edge holding a small fishing rod, staring at a red-white float on the water. In the foreground on a grey rock, a small glossy red-orange crab with tall stalk eyes peeks out, one claw raised teasingly. Reeds and lily pads around.
[STYLE block]
```
**Video (Gemini):**
```
The dachshund stares intensely at the bobbing float. The red crab slowly rises from behind the rock and clicks its claw twice, taunting. The dog's ears perk up, it turns its head, sees the crab, gasps and quickly covers its nose with one front paw, eyes narrowing suspiciously. The crab wiggles its stalk eyes smugly. Camera slowly pushes in from crab in foreground to the dog. Sounds: gentle water lapping, crab claw clicking, a small startled dog yelp. Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

## Cảnh 3: Mẻ đầu tiên (0:16–0:24)
**Nội dung:** Phao chìm. Xúc Xích cắn cần kéo hết sức, lùi từng bước, người kéo dài ra như sợi thun. Bụp: kéo lên một chiếc ủng cũ rỉ nước. Cua Đỏ ngã ngửa cười, càng đập đập.
**Chữ trên hình:** "Cá… ủng?"

**Ảnh khung đầu (GPT):**
```
Dynamic low-angle shot on the wooden dock. The small dapple miniature dachshund (black and silver-grey spotted coat, tan markings, long floppy spotted ears, big brown eyes, red collar with gold bone tag, tiny green fishing hat) leans far back, biting the fishing rod, which is bent strongly; its long body stretched with effort, paws braced on the planks. The fishing line goes taut into splashing water. The red-orange crab watches from the edge of the dock.
[STYLE block]
```
**Video (Gemini):**
```
The dachshund pulls the bent rod with all its strength, stepping backward, its long body stretching comically. With a pop an old muddy rubber boot flies out of the water, arcs through the air and lands upright beside the dog, dripping water and a little weed. The dog stares at the boot with a deadpan face. The crab falls on its back laughing, legs kicking, claws clapping. Sounds: reel clicking, water splash, wet boot thud, crab clicking laughter. Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

## Cảnh 4: Tự thân vận động (0:24–0:32)
**Nội dung:** Tức quá, Xúc Xích ném mũ, lùi lấy đà rồi nhảy ùm xuống hồ, tiếp nước bằng bụng. Ếch Cốm đang ngồi trên lá sen bị tạt ướt sũng, mũ cánh sen trôi mất, mặt cau có.
**Chữ trên hình:** "Bắt bằng mồm luôn!"

**Ảnh khung đầu (GPT):**
```
Side view, the small dapple miniature dachshund (black and silver-grey spotted coat, tan markings, long floppy spotted ears, big brown eyes, red collar with gold bone tag) mid-air in a heroic leap off the end of the wooden dock, legs stretched out like superman, ears flying back, determined face, its green fishing hat tumbling in the air behind. Below, on a lily pad, a small bright green frog with huge eyes wearing a tiny lotus-petal hat looks up in alarm.
[STYLE block]
```
**Video (Gemini):**
```
The dachshund flies through the air in slow motion, then belly-flops into the lake with a huge comic splash. A wave of water drenches the little green frog on the lily pad; its lotus-petal hat floats away. The frog sits soaked, blinking with an annoyed face, a drop of water dripping from its chin. The dog's head pops up from the water, paddling, ears floating. Camera static, slight shake on impact. Sounds: whoosh, big belly-flop splash, frog's grumpy croak. Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

## Cảnh 5: Ông Chép (0:32–0:40)
**Nội dung:** Xúc Xích bơi chó, nhìn xuống nước. Một cái bóng vàng khổng lồ lượn bên dưới. Ông Chép nổi lên ngay cạnh, to gấp năm lần chú, râu dài rủ xuống, liếc chú bằng đôi mắt lim dim. Mắt Xúc Xích tròn xoe.
**Chữ trên hình:** "Con này… hơi bị to."

**Ảnh khung đầu (GPT):**
```
Water-level shot, half above and half below the surface (split view). Above: the small dapple miniature dachshund (black and silver-grey spotted coat, tan markings, long floppy wet ears floating, big brown eyes, red collar with gold bone tag) doggy-paddling, looking down. Below: a huge golden-orange carp five times bigger than the dog, big shiny scales, long droopy moustache-like barbels, heavy-lidded grumpy old-man expression, gliding just beneath the dog. Sun rays through clear teal water.
[STYLE block]
```
**Video (Gemini):**
```
The dog paddles happily until it notices the giant golden shadow below. The huge carp slowly rises and surfaces right beside the dog, its barbels dripping, and gives the dog a long unimpressed side-eye. The dog freezes mid-paddle, eyes going huge and round, ears lifting, a nervous gulp. Bubbles rise. Camera slowly rises from underwater to the surface. Sounds: muffled underwater ambience, bubbles, a deep lazy fish blub, small nervous dog whimper. Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

## Cảnh 6: Trượt nước bất đắc dĩ (0:40–0:48)
**Nội dung:** Xúc Xích liều ngoạm đuôi Ông Chép. Ông Chép phóng đi, kéo chú lướt trên mặt hồ như vận động viên trượt nước, tai bay phần phật. Cả đàn vịt con chạy loạn, Vịt Mẹ dang cánh che con.
**Chữ trên hình:** "Ai câu ai đây?!"

**Ảnh khung đầu (GPT):**
```
Dynamic wide action shot across the lake surface. The huge golden-orange carp with moustache barbels races forward, half out of the water, while the small dapple miniature dachshund (black and silver-grey spotted coat, tan markings, long floppy spotted ears, red collar with gold bone tag) bites onto its tail fin and skims behind it across the water like a water-skier, ears flapping, huge spray trail. In the path, a white mother duck with a tiny blue head scarf spreads her wings over four fluffy yellow ducklings in panic.
[STYLE block]
```
**Video (Gemini):**
```
The carp zigzags at high speed across the lake, towing the dachshund who skims on its belly over the water, cheeks flapping in the wind, eyes wide. They swerve just past the mother duck; the ducklings scatter in all directions quacking, the mother duck flaps furiously. Spray and ripples everywhere. Camera follows with a fast side-tracking shot, slight motion blur. Sounds: rushing water, wind whoosh, frantic quacking, dog's wobbly howl. Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

## Cảnh 7: Hạ cánh (0:48–0:56)
**Nội dung:** Ông Chép quẫy đuôi một cái, Xúc Xích bay vèo lên bờ, rơi tõm vào thùng mồi, chỉ thò mỗi đầu ra, trên đầu dính con giun. Anh Bin chị Na quay lại, há hốc. Phía sau, Cua Đỏ lén lút tha hộp xúc xích đi.
**Chữ trên hình:** "Khoan… hộp xúc xích của tui!"

**Ảnh khung đầu (GPT):**
```
Shore near the dock. The small dapple miniature dachshund (black and silver-grey spotted coat, tan markings, long floppy wet spotted ears, big brown eyes, red collar with gold bone tag) is stuck inside a blue plastic bait bucket with only its dizzy head poking out, a cartoon worm on its head. Next to it the young Asian man (grey t-shirt, jeans) and young chubby Asian woman (round glasses, dusty-rose t-shirt, navy shorts, green bracelets) sit on folding chairs looking shocked. In the background, the small red-orange crab sneaks away carrying a small open lunch box of sausages over its head.
[STYLE block]
```
**Video (Gemini):**
```
Start with the dog dizzily shaking its head in the bucket, eyes spinning, the worm wiggling. The couple gasps and leans in. Then the dog's eyes snap into focus, its ears shoot up as it spots the crab tiptoeing away with the sausage lunch box; rack focus from dog to crab in the background. The crab freezes mid-step, looks back guiltily. Sounds: bucket clunk, dizzy wobble sound, crab's tiny tiptoe clicks, a sharp alarmed dog bark. Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

## Cảnh 8: Rượt đuổi và cú kẹp thứ hai (0:56–1:04)
**Nội dung:** Xúc Xích nhảy khỏi thùng, rượt Cua Đỏ vòng quanh tảng đá. Cua dừng phắt lại, quay ngoắt, kẹp trúng mũi chú lần nữa. Mũi đỏ phồng lên, mắt chú rưng rưng.
**Chữ trên hình:** "LẠI NỮA!!!"

**Ảnh khung đầu (GPT):**
```
Close-up, eye level on the dirt path by the lake. The small dapple miniature dachshund (black and silver-grey spotted coat, tan markings, long floppy spotted ears, big brown eyes, red collar with gold bone tag) with a shocked open-mouth face, its black nose being pinched by the claw of the small red-orange crab standing on a rock. The dog's nose is swelling pink-red, eyes watering, yellow cartoon pain spark lines near the nose. Sausage lunch box dropped on the ground nearby.
[STYLE block]
```
**Video (Gemini):**
```
Start with a quick chase: the dachshund runs around the rock after the crab, long body curving. The crab suddenly stops, spins around and clamps its claw on the dog's nose. The dog freezes, eyes bulging, ears standing straight up, the nose slowly swelling bright red, tears welling up. The crab holds on, stalk eyes looking proud. Camera snaps into a close-up on the pinch. Sounds: scurrying feet, crab claw snap, a long comic squeaky dog whine. Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

## Cảnh 9: Hắt xì định mệnh (1:04–1:12)
**Nội dung:** Mũi ngứa quá, Xúc Xích hít hít rồi hắt xì một cái thật mạnh. Cua Đỏ văng xoay tròn rồi rơi trúng chiếc xô trống. Xúc Xích nhìn vào xô: con cua run rẩy, mắt rưng rưng. Chú khựng lại, mềm lòng.
**Chữ trên hình:** "Bắt được rồi… nhưng mà…"

**Ảnh khung đầu (GPT):**
```
Medium shot. The small dapple miniature dachshund (black and silver-grey spotted coat, tan markings, long floppy spotted ears, red collar with gold bone tag) with a swollen red nose, head thrown back, eyes squeezed shut, about to sneeze, the small red-orange crab still clinging to its nose. A small empty metal bucket sits nearby on the dock planks. Golden light.
[STYLE block]
```
**Video (Gemini):**
```
The dog's nose twitches, it inhales in three big comic breaths, then lets out a giant sneeze. The crab flies off spinning through the air and lands with a clang inside the metal bucket. The dog trots over, peeks into the bucket, first with a triumphant grin, then its expression softens: the crab inside is trembling with big teary eyes. The dog's ears droop, it tilts its head with pity. Sounds: three sniff-inhales, huge sneeze, whoosh, metal clang, a tiny sad crab squeak. Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

## Cảnh 10: Món quà lúc hoàng hôn (1:12–1:20)
**Nội dung:** Xúc Xích nghiêng xô thả Cua Đỏ về hồ. Một lát sau, Cua Đỏ bò lên bờ, giơ càng tặng chú một con cá nhỏ xíu. Xúc Xích vẫy đuôi tít mù, anh Bin chị Na ngồi xổm cười tươi. Hoàng hôn cam rực trên hồ.
**Chữ trên hình:** "Kẻ thù hóa bạn thân 🦀🐶" rồi "Tập sau: Xúc Xích đi cắm trại?"

**Ảnh khung đầu (GPT):**
```
Sunset over the lake, warm orange and pink sky reflected on the water. At the water's edge, the small red-orange crab offers a tiny silver fish held up in its claw to the small dapple miniature dachshund (black and silver-grey spotted coat, tan markings, long floppy spotted ears, big brown eyes, slightly red swollen nose, red collar with gold bone tag), who looks down at it touched and happy. Behind them the young Asian man (grey t-shirt, jeans) and young chubby Asian woman (round glasses, dusty-rose t-shirt, navy shorts, green bracelets) squat down smiling warmly. In the far background, the big golden carp's head peeks out of the water with a tiny approving smile.
[STYLE block]
```
**Video (Gemini):**
```
The crab holds the tiny fish up to the dog. The dog gently takes it, then its tail starts wagging wildly, whole body wiggling with joy; it gives the crab a soft friendly nudge with its red nose. The crab waves a claw. The couple laughs and the woman claps her hands. Camera slowly pulls back and rises into a wide sunset shot of the lake with all characters small in frame, the carp blowing a bubble in the distance. Sounds: gentle water lapping, happy dog panting and a short joyful bark, soft laughter, evening crickets. Vertical 9:16, 8 seconds, 3D animated feature-film style matching the input image exactly, keep all character designs consistent, smooth cartoon physics with squash-and-stretch, no dialogue, no text on screen, no background music, only natural sound effects and character noises.
```

---

## Mẹo giữ nhân vật đồng nhất
- Luôn đính kèm ảnh gốc và tờ nhân vật (0A, 0B) khi tạo ảnh từng cảnh. Viết thêm: "same dachshund as reference, identical spots and markings".
- Nếu GPT đổi màu lông hoặc đổi vòng cổ, sửa lại bằng câu: "Fix: the dog's collar must be red with a gold bone tag; coat black and silver-grey dapple with tan points."
- Veo hay tự sinh chữ hoặc lời nói lạ. Nếu clip có tiếng người nói, tạo lại và nhấn mạnh "no speech, no talking".
- Cảnh 6 và 8 nhiều chuyển động. Nếu hình bị méo, tách mỗi cảnh thành 2 clip 4 giây (2 ảnh khung đầu).
- Nhạc nền chèn lúc dựng, vì clip nào cũng ghi "no background music" để ghép không bị lệch nhạc.
