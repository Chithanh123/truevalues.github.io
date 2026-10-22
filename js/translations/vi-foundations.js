/** Vietnamese author draft; independent bilingual and cognitive review pending. */
export const viFoundations = {
  version: '0.4.0',
  reviewStatus: 'draft',
  aims: [
    'Tìm hiểu cách các quan niệm về con người, quan hệ xã hội, quyền lực và tự nhiên định hình phán đoán chính trị trước khi quy các phán đoán đó về lập trường chính sách.',
    'Phân biệt các giả định về thực tại xã hội với ưu tiên đạo đức, cách nhận biết và những thiết chế được đề xuất.',
    'Thể hiện bất đồng trong và giữa các truyền thống chính trị bằng những góc nhìn diễn giải có thể giao nhau, thay vì những nhãn căn tính loại trừ lẫn nhau.',
    'Phát triển một ngân hàng phát biểu Anh–Việt rộng hơn, được thẩm định độc lập, rồi tìm hiểu mối liên hệ giữa các tiền đề được nêu và quyết định trong những vai trò cùng ràng buộc cụ thể.',
  ],
  categories: {
    ontology: { label: 'Con người và thực tại xã hội', description: 'Các giả định về đặc điểm của con người, xã hội và những quan hệ giúp giải thích đời sống chính trị.' },
    normative: { label: 'Ưu tiên đạo đức', description: 'Những khẳng định về điều đáng được bảo vệ hoặc được xem là lý do chính đáng để hành động chính trị.' },
    epistemology: { label: 'Tri thức và phán đoán', description: 'Các giả định về cách con người có thể biết điều gì đang diễn ra và tri thức của ai nên được dùng khi ra quyết định.' },
    institutions: { label: 'Tổ chức quyền lực', description: 'Những khẳng định về các cách tổ chức có thể đưa nguyên tắc chính trị vào thực tiễn.' },
  },
  lenses: {
    'classical-liberal': {
      label: 'Các cách tiếp cận tự do cổ điển',
      description: 'Thường xuất phát từ việc xem mỗi người là một chủ thể hành động có các quyền tự do cơ bản ngang nhau, với quyền sở hữu và chính quyền bị giới hạn là những biện pháp bảo vệ trước sự cưỡng ép.',
      cautions: 'Những người theo chủ nghĩa tự do cổ điển bất đồng về nghĩa vụ xã hội, bất công trong lịch sử, dân chủ và mức cung ứng công cần thiết cho tự do.',
    },
    'social-liberal': {
      label: 'Các cách tiếp cận tự do xã hội',
      description: 'Gắn tự do cá nhân và sự đa dạng trong cách sống với những điều kiện xã hội cần thiết để con người có thể lựa chọn một cách thực chất.',
      cautions: 'Những người theo chủ nghĩa tự do xã hội khác nhau về tái phân phối, năng lực nhà nước, giới hạn của thị trường và những cơ hội cần được bảo đảm.',
    },
    'social-democratic': {
      label: 'Các cách tiếp cận dân chủ xã hội',
      description: 'Nhấn mạnh bình đẳng chính trị, tổ chức của người lao động và việc cùng bảo đảm các nhu cầu, đồng thời vẫn dành vai trò đáng kể cho thị trường và sở hữu tư nhân.',
      cautions: 'Dân chủ xã hội bao gồm những quan niệm cạnh tranh về giai cấp, tăng trưởng, phúc lợi, sở hữu và phạm vi dân chủ trong kinh tế.',
    },
    'democratic-socialist': {
      label: 'Các cách tiếp cận xã hội chủ nghĩa dân chủ',
      description: 'Xem sự tập trung quyền kiểm soát kinh tế là rào cản đối với dân chủ và tìm kiếm các hình thức sở hữu xã hội hoặc kiểm soát dân chủ đối với sản xuất.',
      cautions: 'Những người theo chủ nghĩa xã hội dân chủ bất đồng về thị trường, kế hoạch hóa, quản trị nơi làm việc, nhà nước và con đường thay đổi.',
    },
    marxist: {
      label: 'Các cách tiếp cận Marxist',
      description: 'Phân tích đời sống chính trị thông qua các quan hệ sản xuất biến đổi trong lịch sử, quyền lực giai cấp và xung đột về quyền kiểm soát nguồn lực xã hội.',
      cautions: 'Các truyền thống Marxist khác nhau về nhà nước, năng lực chủ động của con người, văn hóa, giới, sinh thái, dân chủ và chiến lược cách mạng hoặc cải cách.',
    },
    conservative: {
      label: 'Các cách tiếp cận bảo thủ',
      description: 'Thường nhấn mạnh nghĩa vụ được kế thừa, giới hạn của việc thiết kế có chủ ý và tri thức thực tiễn được lưu giữ trong các thiết chế đã hình thành.',
      cautions: 'Các truyền thống bảo thủ khác nhau giữa các xã hội và bất đồng về thứ bậc, thị trường, tôn giáo, bản sắc quốc gia và phạm vi cải cách.',
    },
    libertarian: {
      label: 'Các cách tiếp cận tự do cá nhân triệt để',
      description: 'Đặc biệt coi trọng tự do trước sự cưỡng ép và khả năng phối hợp tự nguyện ngoài quyền lực tập trung.',
      cautions: 'Các nhánh hữu và tả của truyền thống này bất đồng sâu sắc về sở hữu, lợi thế được thừa hưởng, chủ nghĩa tư bản và điều gì khiến một sự sắp xếp là tự nguyện.',
    },
    republican: {
      label: 'Các cách tiếp cận cộng hòa',
      description: 'Hiểu tự do một phần là sự bảo vệ trước tình trạng lệ thuộc vào quyền lực mà người khác có thể thực thi khi không có khả năng phản đối hoặc kiểm soát hữu hiệu.',
      cautions: 'Cộng hòa ở đây chỉ một truyền thống chính trị, không phải một đảng; các nhánh bất đồng về sự tham gia công dân, sở hữu và lệ thuộc kinh tế.',
    },
    communitarian: {
      label: 'Các cách tiếp cận cộng đồng luận',
      description: 'Nhấn mạnh cách các mối quan hệ, thực hành chung và cộng đồng cụ thể góp phần hình thành căn tính và nghĩa vụ.',
      cautions: 'Cộng đồng không đồng nghĩa với đồng thuận tuyệt đối; các cách tiếp cận khác nhau về bất đồng, loại trừ, việc thuộc nhiều cộng đồng và thẩm quyền được kế thừa.',
    },
    feminist: {
      label: 'Các cách tiếp cận nữ quyền',
      description: 'Xem xét cách quyền lực mang tính giới, hoạt động chăm sóc, sự phụ thuộc và những quan hệ xã hội giao nhau định hình vị thế chính trị cùng đời sống hằng ngày.',
      cautions: 'Nữ quyền bao gồm các cách tiếp cận tự do, xã hội chủ nghĩa, cấp tiến, coi trọng chăm sóc, giao thoa và những cách tiếp cận khác có bất đồng đáng kể.',
    },
    ecological: {
      label: 'Các cách tiếp cận chính trị sinh thái',
      description: 'Đặt sự phụ thuộc sinh thái, các giới hạn và quan hệ với thế giới ngoài con người vào trung tâm của việc giải thích chính trị và nghĩa vụ.',
      cautions: 'Các cách tiếp cận sinh thái bất đồng về tăng trưởng, công nghệ, thị trường, đạo đức lấy con người làm trung tâm và cách chia sẻ gánh nặng môi trường.',
    },
    decolonial: {
      label: 'Các cách tiếp cận giải thực dân và chống thực dân',
      description: 'Tìm hiểu cách lịch sử thực dân và những thứ bậc còn tiếp diễn định hình thẩm quyền, tri thức, tư cách thành viên chính trị và yêu sách về quyền tự quyết.',
      cautions: 'Đây là những truyền thống khác biệt và đa dạng từ bên trong; không một phát biểu đơn lẻ nào đại diện cho các góc nhìn bản địa hoặc mọi xã hội từng bị thực dân hóa.',
    },
    anarchist: {
      label: 'Các cách tiếp cận vô chính phủ',
      description: 'Chất vấn sự cần thiết và tính chính đáng của các thứ bậc bị áp đặt, đồng thời tìm hiểu tự quản, tương trợ và liên kết tự nguyện.',
      cautions: 'Các truyền thống vô chính phủ khác nhau về sở hữu, phối hợp, tổ chức và cách đối phó với bất bình đẳng bền vững mà không dùng quyền cai trị tập trung.',
    },
  },
  items: {
    'premise-personal-agency': {
      text: 'Một cá nhân có thể hình thành những cam kết chính trị độc lập với các nhóm xã hội mà họ thuộc về.',
      rationale: 'Tìm hiểu mức độc lập tương đối của năng lực chủ động so với tư cách thành viên nhóm. Đồng ý có thể liên quan đến khả năng bất đồng, thay vì một quan niệm cá nhân luận về xã hội.',
    },
    'premise-social-relations': {
      text: 'Lợi ích chính trị của một người được hình thành thông qua các mối quan hệ của họ với người khác.',
      rationale: 'Tìm hiểu cách nhìn lợi ích thông qua quan hệ. Ảnh hưởng xã hội, sự hình thành căn tính và lệ thuộc kinh tế là những cách hiểu khác nhau; phát biểu này không phải mặt đảo ngược của năng lực chủ động cá nhân.',
    },
    'premise-economic-power': {
      text: 'Quyền kiểm soát nguồn lực sản xuất là một nguồn quan trọng tạo nên quyền lực chính trị lâu bền.',
      rationale: 'Tìm hiểu tầm quan trọng của quyền lực kinh tế trong việc giải thích. Người trả lời cũng có thể đang mô tả tham nhũng, vận động hành lang hoặc một nền kinh tế cụ thể.',
    },
    'premise-ecological-dependence': {
      text: 'Không thể hiểu xã hội loài người tách rời khỏi các hệ sinh thái duy trì sự tồn tại của xã hội đó.',
      rationale: 'Tìm hiểu sự gắn kết với sinh thái như một tiền đề giải thích. Tán thành một sự thật hoặc lo ngại về thiên tai gần đây không nhất thiết hàm ý một triết lý sinh thái rộng hơn.',
    },
    'premise-own-good': {
      text: 'Mỗi người nên được tự do theo đuổi quan niệm riêng về một cuộc sống tốt đẹp, với điều kiện họ tôn trọng quyền tự do tương tự của người khác.',
      rationale: 'Tìm hiểu tự do bình đẳng giữa những cách sống khác nhau. Ý nghĩa của sự tôn trọng và các điều kiện xã hội của tự do vẫn để ngỏ.',
    },
    'premise-nondomination': {
      text: 'Tự do đòi hỏi sự bảo vệ trước quyền lực cho phép người khác tùy ý can thiệp vào cuộc sống của mình.',
      rationale: 'Tìm hiểu tự do như sự bảo vệ trước quyền lực không được kiểm soát. Người tham gia có thể hiểu can thiệp là thiệt hại đã xảy ra thay vì khả năng chi phối luôn sẵn có.',
    },
    'premise-care-obligations': {
      text: 'Sự phụ thuộc vào chăm sóc tạo ra những nghĩa vụ mà các thiết chế chính trị nên thừa nhận.',
      rationale: 'Tìm hiểu chăm sóc và phụ thuộc như căn cứ của nghĩa vụ. Trách nhiệm gia đình, cung ứng công và ghi nhận công việc không được trả công có thể dẫn đến các cách hiểu khác nhau.',
    },
    'premise-inherited-obligations': {
      text: 'Việc thuộc về một cộng đồng có thể tạo ra những nghĩa vụ mà một người không tự lựa chọn.',
      rationale: 'Tìm hiểu nghĩa vụ không do lựa chọn. Đồng ý có thể nói đến tương trợ, khắc phục tổn hại trong lịch sử, thẩm quyền theo tập quán hoặc nghĩa vụ pháp lý; điều đó không xác lập sự ủng hộ thứ bậc.',
    },
    'premise-dispersed-knowledge': {
      text: 'Tri thức cần để phối hợp một xã hội phân tán đến mức không một cơ quan quyền lực trung ương nào có thể nắm giữ đầy đủ.',
      rationale: 'Tìm hiểu tri thức phân tán. Giới hạn thông tin tự nó không quyết định thị trường, kế hoạch hóa công hay phối hợp có sự tham gia sẽ hoạt động tốt hơn.',
    },
    'premise-inherited-knowledge': {
      text: 'Các thực hành đã tồn tại lâu đời có thể chứa tri thức hữu ích mà những người tham gia không giải thích được đầy đủ.',
      rationale: 'Tìm hiểu tri thức ngầm trong thực hành được kế thừa. Tri thức hữu ích không xác lập tính chính đáng của mọi truyền thống hoặc khiến truyền thống không thể bị phê bình.',
    },
    'premise-situated-knowledge': {
      text: 'Những người trải qua một hình thức loại trừ có tri thức về nó mà người quan sát bên ngoài có thể bỏ sót.',
      rationale: 'Tìm hiểu đóng góp của trải nghiệm gắn với vị trí xã hội. Điều này không khẳng định trải nghiệm luôn đúng hoặc mọi người trong một nhóm có cùng tri thức.',
    },
    'premise-testable-explanations': {
      text: 'Một cách giải thích chính trị cần sẵn sàng được sửa đổi khi bằng chứng có thể được xem xét công khai mâu thuẫn với nó.',
      rationale: 'Tìm hiểu khả năng sai và việc kiểm tra công khai các khẳng định giải thích. Mong muốn đưa ra câu trả lời được xã hội tán thành và khả năng tiếp cận bằng chứng được công nhận có thể giải thích sự đồng ý; cam kết đạo đức không thể bị quy giản thành kiểm nghiệm thực chứng.',
    },
    'premise-property-independence': {
      text: 'Sở hữu tư nhân được phân bố rộng là một biện pháp quan trọng để bảo vệ trước sự lệ thuộc vào chính quyền.',
      rationale: 'Tìm hiểu một lập luận về thiết chế ủng hộ sở hữu. Mức phân bố, loại tài sản và sự lệ thuộc vào các chủ thể tư nhân cần những phát biểu tiếp nối riêng.',
    },
    'premise-workplace-control': {
      text: 'Những người làm việc trong một doanh nghiệp nên cùng nắm quyền kiểm soát các quyết định lớn của doanh nghiệp đó.',
      rationale: 'Tìm hiểu dân chủ trong kinh tế. Tham vấn, đồng quyết định, sở hữu hợp tác xã và toàn quyền kiểm soát của người lao động là những cách hiểu khác nhau về thiết chế.',
    },
    'premise-contestable-power': {
      text: 'Những người chịu quyền lực của một thiết chế cần có cách hữu hiệu để phản đối và yêu cầu xem xét lại các quyết định của thiết chế đó.',
      rationale: 'Tìm hiểu khả năng phản đối và yêu cầu xem xét lại quyền lực công lẫn tư. Tòa án, tham gia trực tiếp, khiếu nại và tổ chức tập thể có thể thực hiện nguyên tắc này theo các cách khác nhau.',
    },
    'premise-gradual-reform': {
      text: 'Cải cách thường nên thay đổi các thiết chế đã hình thành một cách đủ từ từ để duy trì những chức năng mà con người đang dựa vào.',
      rationale: 'Tìm hiểu tính liên tục khi thay đổi thiết chế. Mức chấp nhận rủi ro, tính khả thi và các giả định về mức nghiêm trọng của bất công hiện tại có thể quan trọng hơn sự gắn bó với truyền thống.',
    },
  },
};
