# Graph Report - QBK-media  (2026-11-16)

## Corpus Check
- 368 files · ~202,684 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .woff2 8, .ttf 7, .srt 7)

## Summary
- 1131 nodes · 2159 edges · 70 communities (64 shown, 6 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 139 edges (avg confidence: 0.86)
- Token cost: 892,573 input · 0 output

## Community Hubs (Navigation)
- Kiểm tra sản xuất B4
- Prompt ảnh Bạch Đằng 938
- Script vẽ Ngô Quyền
- Quay màn hình quảng cáo app
- Bản đồ vệ tinh (geo.mjs)
- Recorder nét vẽ tay
- Thư viện 3D (lib3d)
- Phong cách Cozy & giọng đọc
- Canvas, bàn tay vẽ, ảnh vệ tinh
- Render 3D bằng Playwright
- Autopilot lõi
- Agent biên kịch & đạo diễn
- Engine render.mjs
- Autopilot render
- Test tham chiếu A6
- Demo khung xương nhân vật
- Âm thanh B4 (Brian)
- Autopilot runtime
- Quy trình dựng & kiểm định
- Căn phụ đề & phân tích mẫu
- Catalog, âm thanh, tư thế
- Đóng gói A6
- Vẽ nhân vật (character.mjs)
- Phong cách Amber Noir A6
- Skill âm thanh
- Skill học mẫu & app
- Ảnh vệ tinh & TTS
- Rừng Amazon (kịch bản, QA)
- QA Rùa và Thỏ & app
- Đạo cụ (props.mjs)
- Package skill stickman
- Kiểm tra tham chiếu A6
- Tải ảnh Commons & TikTok
- Sinh scene.json theo dự án
- Định dạng scene (SCENE_FORMAT)
- Phong cách B1 & nghiệm thu
- Lồng tiếng & tự kiểm tra
- Phong cách B4 sinh tồn
- Nhân vật Bạch Đằng 938
- Chế độ B Autopilot
- B4 runtime
- Rừng Amazon (nguồn, phát hành)
- Engine 3D (engine3d)
- Căn phụ đề Whisper & test
- Sơ đồ đoàn phim
- Nghiên cứu mẫu & ve-tinh
- Hệ âm thanh theo truyện
- Làm đá cổ & quảng cáo app
- Thiết kế app: tạo video, trend
- Săn trend & topics
- Thao tác quay app
- Rùa và Thỏ (kịch bản)
- Rùa và Thỏ (phát hành, nguồn)
- Package engine
- Tài sản & giấy phép B1
- Build dự án Bạch Đằng
- Hoạt hình mắt & tay
- Skill săn trend
- Package codeart
- Giấy phép font
- App: nút & tab
- openai.yaml
- Kiểm tra B3
- Bối cảnh Bạch Đằng 938
- Đuôi nhân vật
- Hàm nhiễu ngẫu nhiên
- Đổi tốc độ giọng (retime)
- fetch_sat.sh
- Font Patrick Hand

## God Nodes (most connected - your core abstractions)
1. `Directing Stickman Videos skill` - 31 edges
2. `Recorder` - 28 edges
3. `clamp()` - 27 edges
4. `A6References` - 25 edges
5. `loadProject()` - 20 edges
6. `render()` - 19 edges
7. `color()` - 19 edges
8. `B Autopilot mode` - 19 edges
9. `B Autopilot shared production and acceptance` - 17 edges
10. `Autopilot runtime` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Dàn nhân vật cast: một màu nhận diện mỗi nhân vật` --semantically_similar_to--> `Phong cách line art người que, 4 màu marker (đỏ, vàng, lục, navy)`  [INFERRED] [semantically similar]
  .claude/skills/ve-bang-code/SKILL.md → projects/bach-dang-938/prompts/00-cast.full.txt
- `QBK Media: xưởng video ngắn vẽ bằng code` --conceptually_related_to--> `Không tự đăng mạng xã hội`  [INFERRED]
  CLAUDE.md → .claude/skills/phat-hanh/SKILL.md
- `Cấu trúc 5 bước (hook, bối cảnh, xung đột, cao trào, kết)` --conceptually_related_to--> `Lời đọc Bạch Đằng 938 (narration.txt)`  [INFERRED]
  .claude/skills/viet-kich-ban/SKILL.md → projects/bach-dang-938/audio/narration.txt
- `QBK Media: xưởng video ngắn vẽ bằng code` --references--> `Thẻ kiến thức card.md (studio/references)`  [INFERRED]
  CLAUDE.md → .claude/skills/hoc-mau/SKILL.md
- `Skill lam-video (Nhà sản xuất điều phối, quy trình v2)` --references--> `Lời đọc Bạch Đằng 938 (narration.txt)`  [INFERRED]
  .claude/skills/lam-video/SKILL.md → projects/bach-dang-938/audio/narration.txt

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **QBK film crew pipeline (script → voice → scene → render → QA → publish)** — _claude_agents_bien_kich, _claude_agents_long_tieng, _claude_agents_dao_dien, _claude_agents_hoa_si, _claude_agents_dung_phim, _claude_agents_kiem_dinh, _claude_agents_phat_hanh [INFERRED 0.85]
- **A6 Amber Noir workflow** — _claude_skills_directing_stickman_videos_references_amber_noir, _claude_skills_directing_stickman_videos_references_a6_reference_prompts, _claude_skills_directing_stickman_videos_references_a6_finishing, _claude_skills_directing_stickman_videos_references_a6_finishing_gemini_puck_narration, _claude_skills_directing_stickman_videos_references_amber_noir_flow_veo_route [EXTRACTED 1.00]
- **Directing-stickman asset licensing** — _claude_skills_directing_stickman_videos_assets_b1_attribution, _claude_skills_directing_stickman_videos_assets_b1_lucide_license, _claude_skills_directing_stickman_videos_assets_fonts_ofl_caveat, _claude_skills_directing_stickman_videos_assets_fonts_ofl_notosans, _claude_skills_directing_stickman_videos_assets_fonts_ofl_caveat_sil_ofl_1_1 [EXTRACTED 1.00]
- **B4 Survival Thriller contract set** — claude_skills_directing_stickman_videos_references_b4_survival_storytelling, claude_skills_directing_stickman_videos_references_b4_audio_direction, claude_skills_directing_stickman_videos_references_b4_opening_direction, claude_skills_directing_stickman_videos_references_b4_repeatability_check [EXTRACTED 1.00]
- **B styles on shared manifest runtime** — claude_skills_directing_stickman_videos_references_b1_minimal_handdrawn, claude_skills_directing_stickman_videos_references_b2_colorful_handdrawn, claude_skills_directing_stickman_videos_references_b3_television, claude_skills_directing_stickman_videos_references_b4_survival_storytelling, claude_skills_directing_stickman_videos_references_autopilot_runtime [EXTRACTED 1.00]
- **A Director style references sharing voice continuity** — claude_skills_directing_stickman_videos_references_prehistoric_dark_comedy, claude_skills_directing_stickman_videos_references_cozy_storytelling, claude_skills_directing_stickman_videos_references_historical_cartoon, claude_skills_directing_stickman_videos_references_style_catalog, claude_skills_directing_stickman_videos_references_voice_continuity [EXTRACTED 1.00]
- **Quy trình đoàn phim v2 (biên kịch → lồng tiếng → đạo diễn → dựng → kiểm định → phát hành)** — _claude_skills_viet_kich_ban_skill_viet_kich_ban, _claude_skills_long_tieng_skill_long_tieng, _claude_skills_phan_canh_skill_phan_canh, _claude_skills_dung_phim_skill_dung_phim, _claude_skills_kiem_dinh_skill_kiem_dinh, _claude_skills_phat_hanh_skill_phat_hanh [EXTRACTED 1.00]
- **Dàn nhân vật Bạch Đằng 938** — projects_bach_dang_938_prompts_00_cast_ngo_quyen, projects_bach_dang_938_prompts_00_cast_duong_dinh_nghe, projects_bach_dang_938_prompts_00_cast_kieu_cong_tien, projects_bach_dang_938_prompts_00_cast_luu_hoang_thao, projects_bach_dang_938_prompts_00_cast_vua_nam_han [EXTRACTED 1.00]
- **Nguồn ý tưởng chủ đề (trend, tiêu chí, topics.md)** — _claude_skills_san_trend_skill_san_trend, _claude_skills_y_tuong_chu_de_skill_y_tuong_chu_de, _claude_skills_y_tuong_chu_de_skill_topics_md, _claude_skills_lam_video_skill_lam_video [INFERRED 0.85]
- **Bach Dang 938 AI image prompt set sharing one style and cast sheet** — projects_bach_dang_938_prompts__style_style_block, projects_bach_dang_938_prompts_gemini_app_prompts_character_reference_sheet, projects_bach_dang_938_prompts_04_seal_seal_prompt, projects_bach_dang_938_prompts_05_ngo_quyen_march_march_prompt, projects_bach_dang_938_prompts_06_kieu_cornered_cornered_prompt, projects_bach_dang_938_prompts_07_kieu_letter_letter_prompt [INFERRED 0.85]
- **Bach Dang satellite video production artifacts (brief to publish)** — projects_bach_dang_ve_tinh_brief_brief, projects_bach_dang_ve_tinh_script_script, projects_bach_dang_ve_tinh_narration_narration, projects_bach_dang_ve_tinh_captions_phrases_captions, projects_bach_dang_ve_tinh_sources_sources, projects_bach_dang_ve_tinh_qa_qa_report, projects_bach_dang_ve_tinh_publish_publish_kit [INFERRED 0.85]
- **Amazon flying-river argument (evidence to visual)** — projects_rung_amazon_sources_flying_rivers, projects_rung_amazon_sources_nobre_2014, projects_rung_amazon_sources_smith_2023, projects_rung_amazon_script_vaporflow [EXTRACTED 1.00]
- **App review, feedback and publish flow** — studio_app_qbk_studio_review_view, studio_app_qbk_studio_post_view, studio_app_qbk_studio_video_status_workflow, studio_docs_app_design_duyetvideo_dc, studio_docs_app_design_dangbai_dc [INFERRED 0.85]
- **Rùa và Thỏ new engine assets** — projects_rua_va_tho_script_rabbit_ears, projects_rua_va_tho_script_turtle_shell, projects_rua_va_tho_script_sleep_pose, projects_rua_va_tho_script_finishline [EXTRACTED 1.00]
- **Reference cards mapped to engine style packs** — studio_references_ve_tay_but_chi_card, studio_references_ban_do_dia_chinh_tri_card, studio_references_phac_thao_sepia_card, studio_references_ve_tinh_anh_that_card, studio_references_thi_nghiem_co_card, studio_engine_scene_format_style_packs [INFERRED 0.85]
- **QBK Studio app design screens** — studio_docs_app_design_taovideo_dc, studio_docs_app_design_thuvienmau_dc, studio_docs_app_design_trend_dc [EXTRACTED 1.00]
- **OFL-licensed engine fonts** — studio_engine_fonts_ofl_inter_inter_font, studio_engine_fonts_ofl_notosans_noto_sans_font, studio_engine_fonts_ofl_patrickhand_patrick_hand_font, studio_engine_fonts_ofl_inter_sil_ofl_1_1 [EXTRACTED 1.00]

## Communities (70 total, 6 thin omitted)

### Community 0 - "Kiểm tra sản xuất B4"
Cohesion: 0.08
Nodes (29): analyzeOpening(), checkOpeningFile(), db(), checkB4Production(), digest(), nonempty(), requireThat(), DEFAULT_ROOT (+21 more)

### Community 1 - "Prompt ảnh Bạch Đằng 938"
Cohesion: 0.07
Nodes (39): Prompt 04: Tumbling Official Seal, Prompt 05: Ngo Quyen Leads March, Prompt 06: Kieu Cong Tien Cornered, Prompt 07: Kieu Cong Tien Pleading Letter, Prompt 03: Assassination of Duong Dinh Nghe, 00-cast Character Reference Sheet, Gemini App Image Prompts (Bach Dang 938), Prompt 02: Smirking Shore Soldier (+31 more)

### Community 2 - "Script vẽ Ngô Quyền"
Cohesion: 0.05
Nodes (40): bandBot, bandTop, C, ctx, cv, env, ff, fills (+32 more)

### Community 3 - "Quay màn hình quảng cáo app"
Cohesion: 0.05
Nodes (28): A, args, atmp, bd, bg, BLOB, caps, {chromium} (+20 more)

### Community 4 - "Bản đồ vệ tinh (geo.mjs)"
Cohesion: 0.15
Nodes (38): area(), cache, chaikin(), clouds(), col(), DARK, dots(), F (+30 more)

### Community 5 - "Recorder nét vẽ tay"
Cohesion: 0.11
Nodes (10): apply(), fillPaths(), jit(), line(), mul(), play(), plen(), Recorder (+2 more)

### Community 6 - "Thư viện 3D (lib3d)"
Cohesion: 0.09
Nodes (27): three, build(), canvasTex(), captionHTML(), ease(), esc(), LIB, mat() (+19 more)

### Community 7 - "Phong cách Cozy & giọng đọc"
Cohesion: 0.10
Nodes (28): Style 4 Cozy Storytelling, Cozy character anchor (white filled head and torso), Design / prop identity / first frame / final state scopes, New segment, new story setting, Complete Example (Director), Style 2A Modern Beanie Zeke example, Stop Letting Overthinking Ruin Your Life (Style 1 Dark example), Clip stitching guide (+20 more)

### Community 8 - "Canvas, bàn tay vẽ, ảnh vệ tinh"
Cohesion: 0.15
Nodes (25): credit(), drawGeo(), GEO_TYPES, loadSat(), preloadGeo(), sampleView(), stars(), validateGeo() (+17 more)

### Community 9 - "Render 3D bằng Playwright"
Cohesion: 0.07
Nodes (25): args, base, {chromium}, events, ff, file, filters, FONTS (+17 more)

### Community 10 - "Autopilot lõi"
Cohesion: 0.17
Nodes (20): [command, ...args], designPlane(), FFMPEG, FFPROBE, groupWords(), json(), number(), outputDir() (+12 more)

### Community 11 - "Agent biên kịch & đạo diễn"
Cohesion: 0.13
Nodes (15): Biên kịch (scriptwriter agent), Đạo diễn (director agent), art-requests.md (director-to-artist request file), projects/<slug>/scene.json, Dựng phim (editor agent), Technical checks (decode, ffprobe, contact frames, volumedetect), Họa sĩ vẽ bằng code (code artist agent), Kiểm định (QA agent) (+7 more)

### Community 12 - "Engine render.mjs"
Cohesion: 0.08
Nodes (23): SR, fitCaptions(), args, cues, drawFlags, events, ff, file (+15 more)

### Community 13 - "Autopilot render"
Cohesion: 0.20
Nodes (22): captionY local modification, fontPaths(), hashFile(), loadProject(), mediaPath(), sha(), clamp(), ease() (+14 more)

### Community 15 - "Demo khung xương nhân vật"
Cohesion: 0.13
Nodes (23): back(), clamp(), ctx, cv, drawFigure(), dust, ease(), ff (+15 more)

### Community 16 - "Âm thanh B4 (Brian)"
Cohesion: 0.15
Nodes (21): Meaning-advancing micro-animation, B4 Locked narrator and story-led audio, Brian narrator (ai33/ElevenLabs voice ID nPczCjzI2devNBz1zQrb), Dry performance → scene perspective → dialogue-first balance → encode review, Story-led ending choices, First-frame audio gate, B4 Opening, typography and escalation, First-three-second visual escalation gate (+13 more)

### Community 17 - "Autopilot runtime"
Cohesion: 0.12
Nodes (21): Autopilot runtime, scripts/align_captions.py (Whisper alignment), scripts/autopilot.mjs CLI (doctor/probe/init/validate/preview/approve/render), B3 declarative layers (path/rect/ellipse/group), B4 production tracks (ambience/dialogue/audio_cuts), scripts/gemini-media.mjs Gemini API adapter, Autopilot manifest v1 (project.json), Procedural SFX kinds (tap, paper, pop, chime, jingle) (+13 more)

### Community 18 - "Quy trình dựng & kiểm định"
Cohesion: 0.14
Nodes (16): Bản hoàn chỉnh (final.mp4), Bản xem thử (preview.mp4, --to 20), Skill dung-phim (Dựng phim), Skill kiem-dinh (Kiểm định), Bảng đoàn phim và model (bước 0–6), art-requests.md (yêu cầu đồ mới cho hoa-si), Diễn xuất (acting, cycle walk/run, snap, facing), Hiệu ứng vẽ tay draw (20–40% shot) (+8 more)

### Community 19 - "Căn phụ đề & phân tích mẫu"
Cohesion: 0.16
Nodes (3): num_syl(), ll(), px()

### Community 20 - "Catalog, âm thanh, tư thế"
Cohesion: 0.16
Nodes (14): mixTrack(), SFX_KINDS, synth(), writeWav(), CYCLES, EXPR, POSES, COLORS (+6 more)

### Community 21 - "Đóng gói A6"
Cohesion: 0.22
Nodes (10): audio_hash(), caption_layer(), prepare(), probe(), render(), sha(), stamp(), title_layer() (+2 more)

### Community 22 - "Vẽ nhân vật (character.mjs)"
Cohesion: 0.24
Nodes (17): applyCycle(), blendPose(), DIM, drawCharacter(), drawEars(), drawFace(), drawHat(), drawHeldProp() (+9 more)

### Community 23 - "Phong cách Amber Noir A6"
Cohesion: 0.14
Nodes (16): A6 · Amber Noir style, Amber Noir drawing grammar (matte-black heads, amber light, plum shadows), Route 1 · Google Flow Veo 3.1 Fast (recommended), Route 2 · Renoise MCP, First use and stage guidance, A5 proactive character guidance, Public README style catalogs (stickman-video-director), Stage handoff (已完成 / 还缺什么 / 下一步) (+8 more)

### Community 24 - "Skill âm thanh"
Cohesion: 0.13
Nodes (11): Gemini TTS narration (default voice Bodi), Âm thanh skill (sound design), scribbleGain (pen sound default 0), Synthesized SFX set (pop, whoosh, drum, gong, chime...), A6 reference files source notes, @IfverseTales (drawing inspiration), A6 confirmed finishing standard, A6 title/caption profile (Impact captions, amber active word, white title) (+3 more)

### Community 25 - "Skill học mẫu & app"
Cohesion: 0.19
Nodes (13): Đo bằng máy (analyze_ref.py → analysis.json, contact.png), Skill hoc-mau (Học từ mẫu tham khảo), Thẻ kiến thức card.md (studio/references), App QBK Studio (ArtifactData collections), Bảng chọn phong cách theo thể loại, Học phong cách từ app (styleRequests), Skill lam-video (Nhà sản xuất điều phối, quy trình v2), studio/lessons.md (bài học từ góp ý) (+5 more)

### Community 26 - "Ảnh vệ tinh & TTS"
Cohesion: 0.18
Nodes (4): build(), gpx(), main(), tile()

### Community 27 - "Rừng Amazon (kịch bản, QA)"
Cohesion: 0.17
Nodes (15): Subtitle zone y 1370-1470, Rừng Amazon caption phrases, Rừng Amazon narration, Rừng Amazon creative notes, Font missing ≈ ≥ → glyphs, textFollowsCamera scene flag, Rừng Amazon QA (economy mode, pass), Rừng Amazon script v1 (+7 more)

### Community 28 - "QA Rùa và Thỏ & app"
Cohesion: 0.19
Nodes (14): Rùa và Thỏ final QA report, F1/F2: drawing hand covers subtitles (shots 14, 21), No pen scribble sound (scribbleGain 0) approved exception, QBK Studio phone app (artifact), App db collections (videos, requests, feedback, styleRequests, tiktokLinks, app/*), Review view with timestamped feedback, Video status workflow (dang-lam, cho-duyet, dang-sua, da-duyet, da-dang), SIL Open Font License 1.1 (Patrick Hand) (+6 more)

### Community 29 - "Đạo cụ (props.mjs)"
Cohesion: 0.15
Nodes (12): checkerStrip(), line(), poly(), puff(), ribbon(), SA_AMAZON, SA_COAST, SA_LOST_E (+4 more)

### Community 30 - "Package skill stickman"
Cohesion: 0.15
Nodes (13): dependencies, @napi-rs/canvas@0.1.100, description, engines, node, @napi-rs/canvas, name, private (+5 more)

### Community 31 - "Kiểm tra tham chiếu A6"
Cohesion: 0.36
Nodes (9): CheckError, full_text(), image_info(), local_file(), main(), read_json(), require(), validate_pack() (+1 more)

### Community 32 - "Tải ảnh Commons & TikTok"
Cohesion: 0.26
Nodes (4): get(), main(), slug(), info()

### Community 33 - "Sinh scene.json theo dự án"
Cohesion: 0.19
Nodes (6): photo(), shot(), P(), sa_map(), T(), vmap()

### Community 34 - "Định dạng scene (SCENE_FORMAT)"
Cohesion: 0.23
Nodes (13): actor element, Camera keyframes and textFollowsCamera, Costume / cast (animal disguises ears, tail, shell), Engine extension rules (POSES, PROPS, Recorder no clip), infoPanel prop, pin prop, Poses, expressions, cycles (v1+v2), prop element and prop catalog (+5 more)

### Community 35 - "Phong cách B1 & nghiệm thu"
Cohesion: 0.19
Nodes (11): B Autopilot shared production and acceptance, Project-local shot ledger, B1 Minimal Hand-drawn style, OFL Caveat fallback font, Near-white #FDFDFC faint-grid paper, Full V4 long-form accepted film (2026-10-24), Ryan V4 preview baseline (2026-10-23), Sadaltager V15 archived example (+3 more)

### Community 36 - "Lồng tiếng & tự kiểm tra"
Cohesion: 0.17
Nodes (7): qa.md (bảng ĐẠT/LỖI, giao cho bộ phận), Căn phụ đề theo khoảng lặng (align.py → captions-audio.json), Skill long-tieng (Lồng tiếng và phụ đề), Đầu ra biên kịch (narration.txt, script.md, sources.md, captions-phrases.txt), Skill viet-kich-ban (Biên kịch và kiểm chứng), Khoảng lặng giọng đọc (silences.txt), Cụm phụ đề Bạch Đằng 938 (captions-phrases.txt)

### Community 37 - "Phong cách B4 sinh tồn"
Cohesion: 0.23
Nodes (9): B4 drawing style lock v3 (white-glove), Meridian Tower 40s sample illustrations, Directing Stickman Videos skill, B4 · Survival Thriller, Mode A · Director (A1–A5 storyboards + Omni Flash prompts), Mode B · Autopilot (narrated captioned videos, B1–B4), Styles 1–5 (Classic Minimalist, Beanie Zeke, Prehistoric, Cozy, Historical Cartoon), Upstream vendoring notes (+1 more)

### Community 38 - "Nhân vật Bạch Đằng 938"
Cohesion: 0.29
Nodes (10): Lời đọc Bạch Đằng 938 (narration.txt), Bản nháp lời đọc Bạch Đằng 938, Prompt cast sheet 5 nhân vật, Dương Đình Nghệ (mũ quan vàng), Prompt cast sheet đầy đủ (kèm STYLE line art người que), Kiều Công Tiễn (kẻ phản bội), Lưu Hoằng Tháo (hoàng tử Nam Hán, navy), Ngô Quyền (khăn, đai đỏ, giáo) (+2 more)

### Community 39 - "Chế độ B Autopilot"
Cohesion: 0.21
Nodes (12): B Autopilot mode, Google Gemini Bodi voice (B common fallback), Google Search casting research for new role voices, Semantic single-line subtitles (all B styles), Settings order: user choice → B-style default → B common fallback, Voice-led production, B2 Colorful Hand-Drawn style, B2 approved visual board (+4 more)

### Community 40 - "B4 runtime"
Cohesion: 0.24
Nodes (7): appendB4Audio(), BRIAN, fields(), number(), prepareB4(), text(), cli

### Community 41 - "Rừng Amazon (nguồn, phát hành)"
Cohesion: 0.21
Nodes (12): Rừng Amazon brief, ban-do-toi style (dark data map), Rừng Amazon publish kit, Rừng Amazon fact-check table, Flying rivers (rios voadores), Amazon '20% of Earth's oxygen' lungs myth, National Geographic 2019 / Oxford ECI (Malhi) on Amazon oxygen, A. Nobre, The Future Climate of Amazonia (INPE/ARA 2014) (+4 more)

### Community 42 - "Engine 3D (engine3d)"
Cohesion: 0.26
Nodes (11): engine3d page.html, Caption/label/title overlay (Inter Display Black, yellow keyword), engine3d README, blurband layout (16:9 band, blurred fill), 3D object library (LIB in lib3d.js), render3d.mjs (three.js in Chromium), scene3d.json format, Style grammar (stroke, fill, boil, drawMode, transition, captionBox) (+3 more)

### Community 44 - "Sơ đồ đoàn phim"
Cohesion: 0.20
Nodes (9): so-do.html (Sơ đồ QBK Media), Feedback routing table (content->bien-kich, voice->long-tieng, ...), Đoàn phim org chart (Giám đốc, Nhà sản xuất, agents), 9 phong cách (giay-muc..ban-do-toi), Lộ trình 4 phases, Kiến trúc kỹ thuật (App, Claude Code, engine, tools), ban-do-toi style, Card: Phác thảo điện ảnh sepia (+1 more)

### Community 45 - "Nghiên cứu mẫu & ve-tinh"
Cohesion: 0.20
Nodes (8): Nghiên cứu mẫu (reference research agent), Reference knowledge card (card.md, analysis.json, contact.png), Gửi mẫu mới (submit reference), ve-tinh satellite style (lib/geo.mjs), references index.md, references README, Reference learning workflow (nghien-cuu-mau, analyze_ref.py), Card: Vệ tinh ảnh thật

### Community 46 - "Hệ âm thanh theo truyện"
Cohesion: 0.24
Nodes (10): B Story-led sound system, AUDIO CUT (intentional designed silence), Mix, runtime and acceptance (-16 to -14 LUFS working target), Reference-led sound translation and repair, Candidate sources and rights gate (Pixabay, Uppbeat, Ghosthack), Scene/beat-level sound script, Suspense / apocalypse sound module, Three functional sound layers (Ambience / Foley / Emotional punctuation) (+2 more)

### Community 47 - "Làm đá cổ & quảng cáo app"
Cohesion: 0.20
Nodes (10): Brief: Ancient Ice Making (round 2, 3D rebuild), studio/engine3d (3D rebuild), Yakhchal (ancient ice house), Brief: QBK Studio App Ad, QBK Studio App (studio/app/qbk-studio.html), record_ad.mjs (Playwright app screen recording), App Ad Caption Phrases, Be Vietnam Pro Font (SIL OFL 1.1) (+2 more)

### Community 48 - "Thiết kế app: tạo video, trend"
Cohesion: 0.22
Nodes (10): TaoVideo.dc.html (Làm video mới screen), New video form (topic, genre, style, length, voice speed), Duyệt kịch bản trước toggle, ThuVienMau.dc.html (Thư viện mẫu screen), Bottom navigation (Trang chủ, Làm video, Mẫu, Đoàn phim), Trend.dc.html (Trend screen), TikTok link save input, Hand-draw effect (draw) (+2 more)

### Community 49 - "Săn trend & topics"
Cohesion: 0.31
Nodes (6): Săn trend (trend hunter agent), Trend suggestion card (score N/H/D/A out of 20), Topic list with status lifecycle, Trend report 2026-11-08, Toàn quốc kháng chiến 19/12/1946 topic, Ngày Văn hóa Việt Nam 24/11 topic (score 17)

### Community 50 - "Thao tác quay app"
Cohesion: 0.25
Nodes (9): at(), center(), click(), moveTo(), put(), scrollBy(), scrollTo(), type() (+1 more)

### Community 51 - "Rùa và Thỏ (kịch bản)"
Cohesion: 0.25
Nodes (8): Rùa và Thỏ caption phrases, Rùa và Thỏ narration, Rùa và Thỏ script v1, Rùa và Thỏ engine requests for artist, finishLine prop, ears: rabbit costume, sleep pose with Z z z, shell: turtle costume

### Community 52 - "Rùa và Thỏ (phát hành, nguồn)"
Cohesion: 0.28
Nodes (7): Rùa và Thỏ publish kit, Rùa và Thỏ five titles (question, number, paradox, emotion, direct), The Tortoise and the Hare fable, Rùa và Thỏ sources and fact check, Attributed to Aesop (tương truyền của Ê-dốp), Publish kit view (V.post), Design: DangBai publish kit screen

### Community 53 - "Package engine"
Cohesion: 0.25
Nodes (8): dependencies, @napi-rs/canvas@0.1.100, @napi-rs/canvas, name, private, scripts, test, type

### Community 54 - "Tài sản & giấy phép B1"
Cohesion: 0.32
Nodes (8): B1 assets attribution, Full V4 longform contact sheet (B1 target 2026-10-24), Lucide icons (file-text, clapperboard), Ryan V4 approved B1 baseline (approved-2026-10-23.mp4), Lucide ISC License, Caveat font OFL license, SIL Open Font License 1.1, Noto Sans font OFL license

### Community 55 - "Build dự án Bạch Đằng"
Cohesion: 0.32
Nodes (4): centered(), h_of(), title(), tw()

### Community 56 - "Hoạt hình mắt & tay"
Cohesion: 0.29
Nodes (8): blinkScale(), ell(), frame(), hand(), lerp(), line(), pathOf(), X()

### Community 57 - "Skill săn trend"
Cohesion: 0.33
Nodes (5): Báo cáo studio/trends/<YYYY-MM-DD>.md, Nguồn đã kiểm tra (Google Trends VN RSS, TikTok oembed, Creative Center bị chặn), Skill san-trend (Săn trend), studio/topics.md (bảng chủ đề, trạng thái), Skill y-tuong-chu-de (Ý tưởng và lịch chủ đề)

### Community 58 - "Package codeart"
Cohesion: 0.33
Nodes (6): dependencies, @napi-rs/canvas@0.1.100, @napi-rs/canvas, name, private, type

### Community 59 - "Giấy phép font"
Cohesion: 0.43
Nodes (4): Inter font (The Inter Project Authors), SIL Open Font License 1.1, Noto Sans font, Patrick Hand font (Patrick Wagesreiter)

### Community 61 - "App: nút & tab"
Cohesion: 0.40
Nodes (4): bind(), fireCrew() fire_trigger to crew, playVoice(), render()

### Community 62 - "openai.yaml"
Cohesion: 0.40
Nodes (4): interface, default_prompt, display_name, short_description

### Community 63 - "Kiểm tra B3"
Cohesion: 1.00
Nodes (3): finite(), validateB3(), visit()

### Community 64 - "Bối cảnh Bạch Đằng 938"
Cohesion: 0.67
Nodes (3): Trận Bạch Đằng 938 (bãi cọc và thủy triều), Prompt thuyền chiến Nam Hán thế kỷ 10, Prompt lính Việt trên bờ sông

### Community 65 - "Đuôi nhân vật"
Cohesion: 0.67
Nodes (3): bez(), tailA(), tailB()

### Community 66 - "Hàm nhiễu ngẫu nhiên"
Cohesion: 0.67
Nodes (3): rnd(), S(), wob()

## Knowledge Gaps
- **111 isolated node(s):** `checkpoint.json (tts section)`, `Reference knowledge card (card.md, analysis.json, contact.png)`, `publish.md + thumbnail.png`, `Synthesized SFX set (pop, whoosh, drum, gong, chime...)`, `scribbleGain (pen sound default 0)` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 417 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Đạo diễn (director agent)` connect `Agent biên kịch & đạo diễn` to `Định dạng scene (SCENE_FORMAT)`, `Engine render.mjs`, `Nghiên cứu mẫu & ve-tinh`, `Catalog, âm thanh, tư thế`, `Skill âm thanh`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **What connects `checkpoint.json (tts section)`, `Reference knowledge card (card.md, analysis.json, contact.png)`, `publish.md + thumbnail.png` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Kiểm tra sản xuất B4` be split into smaller, more focused modules?**
  _Cohesion score 0.07617051013277429 - nodes in this community are weakly interconnected._
- **Why does `Lồng tiếng (voice agent)` connect `Agent biên kịch & đạo diễn` to `Skill âm thanh`, `Ảnh vệ tinh & TTS`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Should `Prompt ảnh Bạch Đằng 938` be split into smaller, more focused modules?**
  _Cohesion score 0.07149758454106281 - nodes in this community are weakly interconnected._
- **Why does `Directing Stickman Videos skill` connect `Phong cách B4 sinh tồn` to `Phong cách B1 & nghiệm thu`, `Chế độ B Autopilot`, `Phong cách Cozy & giọng đọc`, `Hệ âm thanh theo truyện`, `Âm thanh B4 (Brian)`, `Autopilot runtime`, `Phong cách Amber Noir A6`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `Script vẽ Ngô Quyền` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._