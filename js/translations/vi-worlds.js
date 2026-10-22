/**
 * Bản dịch tiếng Việt dự thảo dùng để rà soát song ngữ.
 * Đây là các bối cảnh hư cấu, không phải mô phỏng quốc gia hoặc mô tả dân cư.
 * Bản dịch chưa được người rà soát song ngữ độc lập thẩm định.
 */
const notes = (housing, other) => ({
  'housing-urgent': housing,
  'housing-planned': housing,
  ...other,
});

export const viWorlds = {
  version: '0.4.0',
  reviewStatus: 'draft',
  worlds: {
    linden: {
      name: 'Liên bang Linden',
      code: 'Lf',
      inspiration: 'Bối cảnh hư cấu lấy cảm hứng từ Đức',
      summary: 'Một nước cộng hòa liên bang theo thể chế nghị viện, có chính phủ liên minh, quyền hạn đáng kể ở cấp vùng và các cơ quan dịch vụ đô thị giàu kinh nghiệm. Các thành phố đang phát triển chịu sức ép về nhà ở, trong khi người dân tại một số huyện nông thôn phải đi xa hơn để sử dụng dịch vụ. Người dân bất đồng về chi tiêu, phát triển và mức trách nhiệm mà mỗi cấp chính quyền nên đảm nhận.',
      institutions: [
        { label: 'Chính quyền', text: 'Nội các liên minh chịu trách nhiệm trước nghị viện. Chính quyền các vùng có những trách nhiệm riêng, và các quyết định cấp quốc gia thường đòi hỏi thương lượng giữa các cấp.' },
        { label: 'Thẩm quyền địa phương', text: 'Hội đồng đô thị phê duyệt ngân sách địa phương. Lãnh đạo địa phương đề xuất chính sách trong khuôn khổ pháp luật quốc gia và sự giám sát tài chính của cấp vùng.' },
        { label: 'Tham gia và xem xét lại', text: 'Người dân có thể tổ chức hoạt động, kiến nghị và yêu cầu xem xét lại một cách độc lập. Mức độ tham gia không đồng đều, và các tổ chức lâu đời không đại diện cho tiếng nói của tất cả mọi người.' },
        { label: 'Nguồn lực và sự khác biệt', text: 'Năng lực hành chính tốt tồn tại song song với sự chênh lệch về tài chính địa phương. Tăng trưởng đô thị và khả năng tiếp cận dịch vụ ở nông thôn tạo ra các ưu tiên khác nhau trong cùng liên bang.' },
      ],
      scenarioNotes: notes(
        'Hội đồng đô thị phải phê duyệt đề xuất nhà ở của bạn; việc vay vốn chịu sự giám sát của cấp vùng. Khu nhà kho đã thuộc sở hữu công. Cả hai phiên bản tình huống đều áp dụng cùng một chế độ sở hữu, các hình thức tài trợ được cho phép và quy trình phê duyệt.',
        {
          'public-assembly': 'Trong tình huống hư cấu này, chính quyền đô thị được cấp vùng trao quyền lựa chọn giữa các quy định tụ họp đã nêu. Mọi phương án đều bảo đảm lối tiếp cận cho hoạt động khẩn cấp và cơ chế khiếu nại độc lập; vai trò của bạn là gửi ý kiến của một người dân, không phải ban hành hạn chế.',
          'water-partnership': 'Hội đồng huyện nông thôn có một khoản tài trợ đã được phê duyệt, trong đó cho phép rõ ràng quan hệ hợp tác với đối tác ở nước ngoài như đề xuất. Kiểm toán viên cấp vùng xem xét sổ sách. Việc thương lượng với các đô thị lân cận không làm thay đổi ngân sách đã nêu trong tình huống.',
          'community-festival': 'Một ban tổ chức lễ hội đô thị được bổ nhiệm tiếp nhận đề xuất của người dân trước khi hội đồng phê duyệt kinh phí. Mức hỗ trợ văn hóa của cấp vùng được giữ cố định trong bài tập này. Các hội lâu đời, cư dân mới và người trẻ bất đồng về chương trình.',
          'service-contract': 'Bạn làm việc tại một cơ quan dịch vụ cấp huyện, được giao quyền so sánh các phương thức cung cấp dịch vụ trong phạm vi ngân sách đã duyệt. Việc rà soát mua sắm công áp dụng cho cả phương án thuê nhà cung cấp theo hợp đồng lẫn phương án do khu vực công thực hiện; lựa chọn của bạn không được thay đổi điều kiện được hưởng dịch vụ.',
          'community-history': 'Hội độc lập của bạn sử dụng ngân sách triển lãm riêng do thành viên phê duyệt. Các thành viên, bao gồm cư dân lâu năm và cư dân mới, phê duyệt chương trình. Nhiệm vụ được giao không cho phép bạn quyết định ngân sách đô thị hoặc chương trình giảng dạy công lập.',
          'public-records': 'Cơ quan của bạn có cùng một mức công khai thông tin tối thiểu theo luật và một cơ chế xem xét lại độc lập. Bài tập nói về việc cung cấp thêm khả năng tiếp cận vượt trên mức tối thiểu đó, theo sự cho phép rõ ràng của cấp vùng; không phương án nào cho phép giữ lại hồ sơ mà luật yêu cầu phải công khai.',
          'regional-cooperation': 'Với vai trò người đứng đầu nội các liên minh, bạn kiến nghị lên nghị viện một gói đầu tư phòng chống lũ đã được cho phép. Chính quyền các vùng quản lý các dự án nông thôn. Tình huống giữ cố định sự đồng thuận của các cơ quan này và tổng ngân sách, vì vậy lựa chọn còn lại là cách phân bổ.',
        },
      ),
    },
    alder: {
      name: 'Liên hiệp Alder',
      code: 'Ua',
      inspiration: 'Bối cảnh hư cấu lấy cảm hứng từ Hoa Kỳ',
      summary: 'Một nước cộng hòa liên bang theo thể chế tổng thống, với các nhánh quyền lực quốc gia được bầu riêng, chính quyền bang có quyền hạn lớn và dịch vụ địa phương đa dạng. Các thành phố đang mở rộng chịu sức ép về nhà ở, trong khi các hạt nông thôn tranh luận về tiếp cận dịch vụ và phát triển. Các tổ chức dân sự năng động tồn tại song song với chênh lệch về mức sống, sự tham gia và quan điểm về trách nhiệm công.',
      institutions: [
        { label: 'Chính quyền', text: 'Cơ quan hành pháp và cơ quan lập pháp được bầu riêng, cùng chia sẻ quyền lực quốc gia. Các bang giữ những trách nhiệm đáng kể và có thể áp dụng các cách tiếp cận khác nhau trong khuôn khổ quy định chung của quốc gia.' },
        { label: 'Thẩm quyền địa phương', text: 'Hội đồng thành phố và hội đồng hạt phê duyệt ngân sách địa phương. Lãnh đạo địa phương hoạt động trong khuôn khổ luật bang, các quyền được giao và sự giám sát tài chính.' },
        { label: 'Tham gia và xem xét lại', text: 'Người dân có thể tổ chức hoạt động, kiến nghị và phản đối quyết định thông qua việc xem xét lại độc lập. Khả năng dành thời gian, tiếp cận thông tin và nhận trợ giúp pháp lý khác nhau giữa các cộng đồng.' },
        { label: 'Nguồn lực và sự khác biệt', text: 'Các tổ chức địa phương và chuyên môn kỹ thuật là những thế mạnh đáng kể. Sự chênh lệch về nguồn thu thuế và khoảng cách giữa các khu dân cư nông thôn làm việc bảo đảm tiếp cận dịch vụ bình đẳng trở nên khó khăn hơn.' },
      ],
      scenarioNotes: notes(
        'Hội đồng thành phố phải phê duyệt đề xuất nhà ở của bạn; việc vay vốn chịu sự giám sát của cấp bang. Khu nhà kho đã thuộc sở hữu công. Cả hai phiên bản tình huống đều áp dụng cùng một chế độ sở hữu, các hình thức tài trợ được cho phép và quy trình phê duyệt.',
        {
          'public-assembly': 'Trong tình huống hư cấu này, luật bang cho phép các gói quy định về thời gian, tiếng ồn và địa điểm đã nêu, đồng thời bảo đảm cơ chế khiếu nại độc lập. Bạn là người dân góp ý trong quá trình tham vấn. Không phương án nào cho bạn quyền tự điều chỉnh các cuộc tụ họp.',
          'water-partnership': 'Hội đồng hạt có một khoản tài trợ cho phép rõ ràng cả công việc trong nước lẫn quan hệ hợp tác quốc tế như đề xuất. Mọi gói phương án đều chịu sự rà soát tài chính của cấp bang. Trong bài tập này, không thể bổ sung nguồn thu khác của hạt vào khoản tài trợ cố định.',
          'community-festival': 'Một ban địa phương kiến nghị chương trình lễ hội sử dụng kinh phí công lên hội đồng. Quá trình tham vấn có các nhóm lâu đời, cư dân mới và người tham gia trẻ tuổi. Mọi gói phương án đều cho phép tổ chức thêm sự kiện bằng nguồn lực tư nhân.',
          'service-contract': 'Bạn làm việc tại cơ quan dịch vụ của hạt, được giao quyền bằng văn bản để lựa chọn giữa các hình thức cung cấp dịch vụ đã nêu. Cùng một bộ yêu cầu về điều kiện được hưởng dịch vụ, kiểm toán và chất lượng thực hiện được áp dụng bất kể nhà cung cấp thuộc khu vực công hay được thuê theo hợp đồng.',
          'community-history': 'Hội dân sự độc lập của bạn quyết định triển lãm theo nhiệm vụ do thành viên giao. Trong bài tập này, quan chức thành phố không được chọn chủ đề. Các thành viên bất đồng về cách chia sẻ không gian giữa các cách kể được truyền lại và những trải nghiệm mới hơn.',
          'public-records': 'Quy định của bang xác lập mức công khai thông tin tối thiểu và cơ chế xem xét lại độc lập. Lựa chọn trong phạm vi quyền được giao của bạn liên quan đến việc công bố thêm hoặc hỗ trợ tiếp cận vượt trên mức tối thiểu đó. Mọi phương án vẫn phải đáp ứng các nghĩa vụ công khai theo luật.',
          'regional-cooperation': 'Với vai trò người đứng đầu hành pháp quốc gia, bạn đề xuất một trong các gói phòng chống lũ đã được cho phép lên cơ quan lập pháp. Các đối tác triển khai cấp bang và ở nông thôn đã chấp nhận các điều kiện được nêu. Quyền phê duyệt kinh phí vẫn thuộc cơ quan lập pháp; bạn không có quyền đơn phương chi tiêu.',
        },
      ),
    },
    mere: {
      name: 'Vương quốc Mere',
      code: 'Km',
      inspiration: 'Bối cảnh hư cấu lấy cảm hứng từ Vương quốc Anh',
      summary: 'Một nước quân chủ lập hiến theo thể chế nghị viện, có các cơ quan được phân quyền và hội đồng địa phương do dân bầu. Các vùng đô thị đông đúc và cộng đồng nông thôn phân tán phụ thuộc vào những cách kết hợp khác nhau giữa dịch vụ địa phương và quốc gia. Các thiết chế công và nhóm tình nguyện giàu kinh nghiệm chịu sức ép về kinh phí, trong khi người dân bất đồng về phân quyền, cung cấp dịch vụ công và thay đổi văn hóa.',
      institutions: [
        { label: 'Chính quyền', text: 'Nội các điều hành dựa trên sự tín nhiệm của nghị viện. Quốc vương giữ vai trò nghi lễ, không đưa ra các quyết định chính sách trong những tình huống này. Các chính quyền được phân quyền nắm giữ những quyền hạn cụ thể.' },
        { label: 'Thẩm quyền địa phương', text: 'Các hội đồng đưa ra quyết định địa phương trong phạm vi quyền được giao. Điều kiện cấp kinh phí và việc phê duyệt vay vốn có sự tham gia của chính quyền quốc gia hoặc chính quyền được phân quyền có liên quan.' },
        { label: 'Tham gia và xem xét lại', text: 'Người dân tham gia thông qua các cuộc tham vấn, các hội, đại diện dân cử và thủ tục xem xét lại. Khả năng tham gia khác nhau tùy theo thời gian, khoảng cách và khả năng tiếp cận thông tin.' },
        { label: 'Nguồn lực và sự khác biệt', text: 'Mạng lưới dịch vụ lâu đời tồn tại song song với bất bình đẳng giữa các vùng. Nhu cầu nhà ở đô thị và khoảng cách đi lại ở nông thôn tạo ra những nhu cầu cạnh tranh đối với nguồn kinh phí công có hạn.' },
      ],
      scenarioNotes: notes(
        'Hội đồng địa phương của bạn phải phê duyệt đề xuất nhà ở theo một cơ chế giao quyền hư cấu về đất đai và tài chính. Khu nhà kho thuộc sở hữu công và mọi gói phương án đều đáp ứng các điều kiện của cơ chế đó. Cơ chế cho phép và quy trình phê duyệt giống hệt nhau ở cả hai phiên bản.',
        {
          'public-assembly': 'Trong cuộc tham vấn hư cấu này, hội đồng địa phương được trao quyền rõ ràng để xem xét các gói quy định tụ họp đã nêu. Mỗi gói đều bảo đảm lối tiếp cận cho hoạt động khẩn cấp và việc xem xét lại độc lập. Ý kiến của bạn mang tính tham vấn; nó không chỉ đạo cảnh sát hoặc cán bộ hội đồng.',
          'water-partnership': 'Chính quyền được phân quyền có liên quan đã phê duyệt một khoản tài trợ cho hội đồng nông thôn, trong đó quan hệ hợp tác với đối tác ở nước ngoài là một cách sử dụng hợp lệ. Mọi gói đều cần hội đồng phê duyệt và công khai sổ sách, không làm thay đổi chi phí đã nêu.',
          'community-festival': 'Ban tổ chức lễ hội đưa ra kiến nghị theo quy trình cấp kinh phí đã công bố của hội đồng địa phương. Tình huống nói về một sự kiện dân sự địa phương, không phải nghi lễ hoàng gia hoặc quốc gia. Cư dân lâu năm và cư dân mới đều có thể gửi đề xuất.',
          'service-contract': 'Bạn làm việc cho một hội đồng nông thôn, được giao nhiệm vụ quản lý dịch vụ bằng văn bản. Hội đồng đã cho phép cả việc trực tiếp cung cấp dịch vụ công lẫn mua sắm dịch vụ trong ngân sách đã nêu; quyết định của bạn không được thay đổi quyền được hưởng dịch vụ theo luật.',
          'community-history': 'Hội của bạn chịu trách nhiệm biên tập trong phạm vi sứ mệnh lịch sử bao trùm các nhóm trong cộng đồng và ngân sách riêng cố định. Thành viên phê duyệt chương trình. Nhiệm vụ do thành viên giao, chứ không phải ưu tiên của nội các hoặc hội đồng, xác định trách nhiệm của bạn.',
          'public-records': 'Cơ quan dịch vụ của bạn phải đáp ứng cùng một mức công khai thông tin tối thiểu theo luật hư cấu ở mọi phương án. Cơ chế xem xét lại độc lập vẫn được bảo đảm. Lựa chọn trong phạm vi quyền được giao là cung cấp thêm bao nhiêu khả năng tiếp cận và tổ chức việc đó như thế nào.',
          'regional-cooperation': 'Với vai trò người đứng đầu nội các, bạn kiến nghị một gói đầu tư phòng chống lũ đã được cho phép để nghị viện phê duyệt. Các chính quyền được phân quyền có liên quan đã chấp nhận phương thức triển khai. Quốc vương giữ vai trò nghi lễ và không tham gia lựa chọn cách phân bổ.',
        },
      ),
    },
    hoshima: {
      name: 'Hoshima',
      code: 'Ho',
      inspiration: 'Bối cảnh hư cấu lấy cảm hứng từ Nhật Bản',
      summary: 'Một nước quân chủ lập hiến theo thể chế nghị viện, có các bộ cấp quốc gia, chính quyền cấp vùng và hội đồng địa phương do dân bầu. Các trung tâm đô thị lớn thu hút người dân và đầu tư, trong khi một số cộng đồng nông thôn thích ứng với tình trạng già hóa dân số. Mạng lưới kỹ thuật và lập kế hoạch ứng phó thiên tai mạnh tồn tại song song với năng lực địa phương không đồng đều và các cuộc tranh luận về tính liên tục, sự tham gia và phát triển.',
      institutions: [
        { label: 'Chính quyền', text: 'Nội các chịu trách nhiệm trước nghị viện, và quốc vương giữ vai trò nghi lễ. Các bộ cấp quốc gia phối hợp những chương trình lớn với các cơ quan cấp vùng và đô thị.' },
        { label: 'Thẩm quyền địa phương', text: 'Người đứng đầu hành pháp địa phương trình ngân sách lên hội đồng. Các tiêu chuẩn cấp vùng và quốc gia định hình việc vay vốn, mua sắm công và nghĩa vụ cung cấp dịch vụ.' },
        { label: 'Tham gia và xem xét lại', text: 'Người dân tổ chức thông qua nhiều loại hội và có thể yêu cầu xem xét lại các quyết định của cơ quan công quyền. Khác biệt giữa các thế hệ và các vùng ảnh hưởng đến việc ai tham gia và họ ưu tiên điều gì.' },
        { label: 'Nguồn lực và sự khác biệt', text: 'Chuyên môn kỹ thuật và cơ sở hạ tầng đã có là những thế mạnh. Nhu cầu ở các đô thị lớn, khoảng cách ở nông thôn và thay đổi dân số tạo ra những sức ép khác nhau đối với nguồn lực công.' },
      ],
      scenarioNotes: notes(
        'Hội đồng đô thị phải phê duyệt gói nhà ở theo một cơ chế cho phép tài trợ hư cấu của cấp vùng. Trong tình huống này, khu nhà kho thuộc sở hữu công không có tranh chấp đất đai chưa được giải quyết. Cả hai phiên bản áp dụng cùng các giả định về phê duyệt, tài chính và sở hữu.',
        {
          'public-assembly': 'Một cuộc tham vấn địa phương có thời hạn cho phép rõ ràng các đề xuất quy định tụ họp đã nêu; mỗi đề xuất đều bảo đảm lối tiếp cận cho hoạt động khẩn cấp và việc xem xét lại độc lập. Người dân và những người tổ chức có quan điểm khác nhau; không giả định rằng cả quốc gia có chung một thái độ đối với việc công khai bày tỏ bất đồng.',
          'water-partnership': 'Một đô thị nông thôn có khoản tài trợ dành riêng, với quy định cho phép quan hệ hợp tác về nước với đối tác ở nước ngoài. Cán bộ kỹ thuật cấp vùng đã đánh giá mọi gói là khả thi. Bạn kiến nghị cách phân bổ; hội đồng giữ quyền phê duyệt.',
          'community-festival': 'Ban tổ chức lễ hội đô thị mời người dân đề xuất cách sử dụng ngân sách dân sự cố định. Sự tham gia của các nhóm dân cư lâu đời có vai trò quan trọng, nhưng không quyết định thay quan điểm của cư dân trẻ tuổi hoặc mới đến.',
          'service-contract': 'Bạn quản lý một dịch vụ nông thôn theo sự giao quyền rõ ràng, cho phép tất cả các hình thức cung cấp đã nêu. Các tiêu chuẩn thực hiện của cấp vùng được giữ cố định. Bài tập không yêu cầu bạn suy ra rằng nhân viên khu vực công phải ưu tiên một loại nhà cung cấp cụ thể.',
          'community-history': 'Hội độc lập của bạn ở đô thị chịu trách nhiệm trước thành viên về chủ đề triển lãm. Thỏa thuận sử dụng địa điểm bảo vệ quyền quyết định biên tập của hội. Các thành viên diễn giải lịch sử địa phương, di cư và thay đổi thế hệ theo những cách khác nhau.',
          'public-records': 'Cơ quan của bạn được cho phép rõ ràng để quyết định cung cấp thêm khả năng tiếp cận vượt trên mức tối thiểu chung theo luật. Nghĩa vụ công khai và việc xem xét lại độc lập được giữ nguyên. Chỉ riêng sự thuận tiện hành chính không thể loại bỏ các quyền đã được quy định trong tình huống.',
          'regional-cooperation': 'Trong tình huống hư cấu này, Hoshima cùng một quốc gia láng giềng chia sẻ một hòn đảo, và một lưu vực sông trải qua đường biên giới giữa hai nước. Địa lý này chỉ được giả định cho bài tập hư cấu. Với vai trò người đứng đầu nội các, bạn kiến nghị cách phân bổ đầu tư phòng chống lũ lên nghị viện trong khuôn khổ hợp tác quốc tế đã được phê duyệt trước đó. Chính quyền nông thôn cấp vùng đã chấp nhận các điều kiện triển khai được nêu. Mức độ sẵn sàng về kỹ thuật không quyết định thay việc bạn phải ưu tiên cách phân bổ nào.',
        },
      ),
    },
    namoa: {
      name: 'Cộng hòa Namoa',
      code: 'Nr',
      inspiration: 'Bối cảnh hư cấu lấy cảm hứng từ Fiji',
      summary: 'Một nước cộng hòa đảo theo thể chế nghị viện, với các cộng đồng khác nhau về ngôn ngữ, quan hệ với đất đai, sinh kế và khả năng tiếp cận dịch vụ. Vùng thủ đô có nhu cầu nhà ở cao, trong khi các đảo xa đối mặt với chi phí vận tải và tác động của khí hậu. Mạng lưới cộng đồng và khả năng thích ứng thực tế là những thế mạnh, đồng thời vẫn tồn tại bất đồng về đại diện, sử dụng đất và ưu tiên đầu tư.',
      institutions: [
        { label: 'Chính quyền', text: 'Nội các chịu trách nhiệm trước nghị viện. Các cơ quan quốc gia phối hợp với hội đồng địa phương và các thiết chế cộng đồng; trách nhiệm và thành phần của những cơ quan này không hoàn toàn giống nhau.' },
        { label: 'Thẩm quyền địa phương', text: 'Ngân sách địa phương cần hội đồng phê duyệt và chịu sự giám sát tài chính cấp quốc gia. Khi có liên quan, phải xem xét các quyền lợi về đất đai theo tập quán; các địa điểm thuộc sở hữu công được xác định rõ trong từng tình huống.' },
        { label: 'Tham gia và xem xét lại', text: 'Người dân tham gia thông qua các tổ chức dân sự, hội đồng và diễn đàn cộng đồng. Các cơ quan này chứa đựng những lợi ích khác nhau; không giả định rằng cơ quan nào đại diện cho mọi thành viên của một nhóm văn hóa.' },
        { label: 'Nguồn lực và sự khác biệt', text: 'Mạng lưới địa phương bền chặt tồn tại song song với chi phí đi lại cao giữa các đảo và cơ sở hạ tầng không đồng đều. Rủi ro khí hậu có ý nghĩa quan trọng, nhưng các cộng đồng cũng tranh luận về dịch vụ hằng ngày, văn hóa và cơ hội kinh tế.' },
      ],
      scenarioNotes: notes(
        'Khu nhà kho đã thuộc sở hữu công, và các quyền sử dụng đất có liên quan đã được giải quyết cho mọi gói được nêu trong tình huống hư cấu này. Vẫn cần hội đồng phê duyệt và cấp quốc gia giám sát việc vay vốn. Các giả định về đất đai và tài chính giống hệt nhau ở cả hai phiên bản.',
        {
          'public-assembly': 'Hội đồng vùng thủ đô đang tham vấn về các gói quy định tụ họp hợp pháp đã nêu. Cơ chế cho phép hư cấu bảo đảm lối tiếp cận cho hoạt động khẩn cấp và cơ chế khiếu nại độc lập. Không lựa chọn nào quyết định cộng đồng nào có quyền phát biểu hoặc tham gia.',
          'water-partnership': 'Khoản tài trợ cho huyện nông thôn cho phép rõ ràng quan hệ hợp tác với một huyện đảo ở nước ngoài. Chi phí triển khai và vận tải đã được tính vào các gói có ngân sách bằng nhau. Bản sắc văn hóa của mỗi cộng đồng không quyết định thay việc bạn nên ưu tiên cách phân bổ nào.',
          'community-festival': 'Một lễ hội địa phương sử dụng kinh phí công có ban tổ chức phải xem xét đề xuất của mọi người dân. Tình huống không gán một quan điểm duy nhất cho bất kỳ nhóm ngôn ngữ hay cộng đồng nào. Vẫn có thể tổ chức các sự kiện bằng nguồn lực tư nhân.',
          'service-contract': 'Bạn quản lý một dịch vụ nông thôn theo sự giao quyền cho phép các hình thức cung cấp công và theo hợp đồng đã nêu. Các yêu cầu về vận tải và tiếp cận đã được đánh giá cho từng hình thức. Mọi phương án đều giữ nguyên điều kiện được hưởng dịch vụ và quyền khiếu nại.',
          'community-history': 'Hội độc lập của bạn ở đô thị có thành viên với những lịch sử gia đình và mối gắn kết cộng đồng khác nhau. Hội được phép lựa chọn bất kỳ chủ đề triển lãm nào đã nêu theo nhiệm vụ do thành viên giao. Không có thiết chế tập quán hoặc nhà nước nào chọn câu trả lời thay bạn.',
          'public-records': 'Một sự cho phép hành chính rõ ràng cho phép các mức tiếp cận bổ sung đã nêu, vượt trên mức công khai tối thiểu chung. Mọi phương án trong tình huống đều có cơ chế xem xét lại; không được giữ lại hồ sơ bắt buộc phải cung cấp vì việc đi đến cơ quan gặp khó khăn.',
          'regional-cooperation': 'Trong tình huống hư cấu này, Namoa cùng một quốc gia láng giềng chia sẻ một hòn đảo, và một lưu vực sông trải qua đường biên giới giữa hai nước. Địa lý này chỉ được giả định cho bài tập hư cấu. Với vai trò người đứng đầu nội các, bạn kiến nghị một cách phân bổ đầu tư phòng chống lũ đã được cho phép để nghị viện phê duyệt. Các đối tác triển khai trên đảo và ở nông thôn đã chấp nhận điều kiện của tình huống. Địa lý giải thích các điều kiện triển khai, nhưng không quyết định trước việc ưu tiên trong nước hay quốc tế.',
        },
      ),
    },
    anbinh: {
      name: 'Cộng hòa An Bình',
      code: 'Ab',
      inspiration: 'Bối cảnh hư cấu lấy cảm hứng từ Việt Nam',
      summary: 'Một nước cộng hòa theo thể chế một đảng, có các cơ quan lập kế hoạch quốc gia, chính quyền cấp tỉnh và hội đồng địa phương. Các thành phố công nghiệp chịu sức ép về nhà ở và môi trường, trong khi khu vực nông thôn có khả năng tiếp cận dịch vụ khác nhau và sinh kế đang thay đổi. Sự phối hợp hành chính và các hội địa phương hỗ trợ phát triển, đồng thời vẫn có bất đồng về sử dụng đất, đại diện và cách xác định ưu tiên.',
      institutions: [
        { label: 'Chính quyền', text: 'Các cơ quan của đảng định hình định hướng quốc gia. Nội các, cơ quan lập pháp và chính quyền cấp tỉnh có những trách nhiệm chính thức riêng trong khuôn khổ điều hành đó.' },
        { label: 'Thẩm quyền địa phương', text: 'Hội đồng và lãnh đạo hành chính địa phương hoạt động trong phạm vi được cấp tỉnh và quốc gia cho phép. Quyền được trao trong một tình huống chỉ áp dụng cho quyết định hư cấu cụ thể đó, không phải nhận định chung về quyền tự chủ địa phương.' },
        { label: 'Tham gia và xem xét lại', text: 'Người dân sử dụng các cuộc tham vấn địa phương, các hội, đại diện và thủ tục khiếu nại. Các kênh hiện có và giới hạn của chúng được nêu cho từng tình huống; không giả định rằng người dân có cùng ưu tiên với các cơ quan lãnh đạo.' },
        { label: 'Nguồn lực và sự khác biệt', text: 'Sự phối hợp hành chính và mạng lưới cộng đồng năng động tồn tại song song với nguồn lực địa phương không đồng đều. Tăng trưởng công nghiệp, di cư, nông nghiệp và tiếp cận dịch vụ tạo ra các ưu tiên khác nhau giữa đô thị và nông thôn.' },
      ],
      scenarioNotes: notes(
        'Một chương trình thí điểm hư cấu cấp tỉnh cho phép rõ ràng cả ba gói đối với khu nhà kho thuộc sở hữu công này, bao gồm các hình thức tài trợ đã nêu. Hội đồng địa phương phải phê duyệt kiến nghị trong khuôn khổ giám sát của cấp tỉnh. Sự cho phép trong chương trình thí điểm giống hệt nhau ở cả hai phiên bản.',
        {
          'public-assembly': 'Cuộc tham vấn địa phương hư cấu này bảo vệ rõ ràng chiến dịch ôn hòa được mô tả và cho phép tất cả các gói quy định đã nêu, kèm cơ chế khiếu nại được quy định. Những quyền được cho phép này được giả định cho bài tập và không mô tả pháp luật về tụ họp ngoài đời thực.',
          'water-partnership': 'Các cơ quan cấp tỉnh và quốc gia đã cho phép khoản tài trợ của huyện nông thôn chi cho công việc trong nước hoặc quan hệ hợp tác với đối tác ở nước ngoài được nêu tên. Mọi gói đều đáp ứng sự cho phép đó. Bạn không được suy ra rằng các khoản chi quốc tế không liên quan cũng được phép.',
          'community-festival': 'Hội đồng địa phương đã cho phép tham vấn người dân về chương trình của lễ hội dân sự này. Một ban được bổ nhiệm xem xét các ý kiến gửi đến theo cùng các tiêu chí đã công bố. Tình huống trao cho người dân một kênh đề xuất, không trao quyền quyết định cuối cùng đối với ngân sách công.',
          'service-contract': 'Bạn là cán bộ cấp huyện không do bầu cử, được cấp tỉnh giao quyền bằng văn bản để lựa chọn giữa các hình thức cung cấp dịch vụ đã nêu. Điều kiện được hưởng dịch vụ, các bảo đảm trong mua sắm công và cơ chế xem xét lại được giữ cố định. Việc thực hiện các nghĩa vụ đó là vấn đề riêng với việc tán thành một hệ thống chính trị.',
          'community-history': 'Hội dân sự đã đăng ký của bạn được cho phép rõ ràng để lựa chọn bất kỳ chủ đề triển lãm nào đã nêu theo quy trình của thành viên. Bài tập trao quyền biên tập có giới hạn đó; không hàm ý quyền hạn không bị hạn chế đối với các triển lãm công cộng khác không liên quan.',
          'public-records': 'Một chương trình thí điểm hành chính hư cấu cho phép rõ ràng các lựa chọn tiếp cận đã nêu, vượt trên một mức công khai tối thiểu chung. Mỗi lựa chọn đều giữ nguyên cùng một quy trình khiếu nại và xem xét lại. Đây là các quy tắc được quy định cho bài tập, không phải nhận định về pháp luật công khai thông tin quốc gia hiện hành.',
          'regional-cooperation': 'Với vai trò người đứng đầu nội các, bạn đề xuất cách phân bổ trong một chương trình hợp tác phòng chống lũ đã được cho phép. Các bước phê duyệt bắt buộc về chính sách của đảng, lập pháp và cấp tỉnh vẫn là một phần của quá trình triển khai ở mọi phương án. Cá nhân bạn không được bỏ qua các cơ quan đó.',
        },
      ),
    },
    suryan: {
      name: 'Liên bang Suryan',
      code: 'Sf',
      inspiration: 'Bối cảnh hư cấu lấy cảm hứng từ Ấn Độ',
      summary: 'Một nước cộng hòa liên bang theo thể chế nghị viện, có các cơ quan cấp bang có quyền hạn lớn, nhiều ngôn ngữ và hệ thống hành chính địa phương đa dạng. Các thành phố phát triển nhanh và các huyện nông thôn có nhu cầu dịch vụ và cơ sở hạ tầng khác nhau. Các tổ chức dân sự, chuyên môn kỹ thuật và sự tham gia bầu cử tồn tại song song với nguồn lực không đồng đều và bất đồng về phát triển, bản sắc và trách nhiệm công.',
      institutions: [
        { label: 'Chính quyền', text: 'Nội các quốc gia chịu trách nhiệm trước nghị viện. Chính quyền bang có những quyền hạn quan trọng, và các chương trình quốc gia thường phụ thuộc vào hợp tác với các cơ quan cấp bang và địa phương.' },
        { label: 'Thẩm quyền địa phương', text: 'Hội đồng đô thị và nông thôn hoạt động trong khuôn khổ luật bang và ngân sách được giao. Năng lực thực tế khác nhau, vì vậy mỗi tình huống nêu rõ các nguồn lực và quyền hạn có sẵn cho nhiệm vụ đó.' },
        { label: 'Tham gia và xem xét lại', text: 'Người dân tổ chức thông qua các nhóm dân sự, nghề nghiệp, ngôn ngữ và cộng đồng đa dạng, và có thể sử dụng các thủ tục xem xét lại. Không giả định rằng một nhóm chỉ có một quan điểm hoặc đại diện cho tất cả thành viên.' },
        { label: 'Nguồn lực và sự khác biệt', text: 'Mạng lưới kỹ thuật và cộng đồng mạnh tồn tại song song với cơ sở hạ tầng và năng lực hành chính không đồng đều. Khả năng tiếp cận bằng ngôn ngữ phù hợp, tăng trưởng đô thị và khoảng cách ở nông thôn ảnh hưởng đến cách dịch vụ công đến với người dân.' },
      ],
      scenarioNotes: notes(
        'Hội đồng thành phố kiến nghị và phê duyệt gói nhà ở theo sự cho phép rõ ràng của cấp bang. Sở hữu công đối với khu nhà kho và các hình thức tài trợ được cho phép đã được xác định trong tình huống này. Các giả định đó được giữ giống hệt nhau ở cả hai phiên bản.',
        {
          'public-assembly': 'Trong cuộc tham vấn hư cấu này, cấp bang cho phép rõ ràng các gói quy định tụ họp đô thị đã nêu, với điều kiện bảo đảm lối tiếp cận cho hoạt động khẩn cấp và việc xem xét lại độc lập. Người dân và người tổ chức có sự đa dạng ngay trong mỗi nhóm; ngôn ngữ hoặc tư cách thành viên cộng đồng không hàm ý một câu trả lời được ưu tiên.',
          'water-partnership': 'Khoản tài trợ cho hội đồng nông thôn được cấp bang và quốc gia cho phép sử dụng cho quan hệ hợp tác với đối tác ở nước ngoài như đề xuất, cũng như công việc địa phương. Mọi gói đều bao gồm chi phí tiếp cận và triển khai đã mô tả trong tình huống, và phải công khai cùng một bộ sổ sách đã kiểm toán.',
          'community-festival': 'Ban tổ chức lễ hội mời gửi đề xuất theo quy định cấp kinh phí dân sự của hội đồng. Tình huống không đồng nhất một tập quán lâu đời với toàn bộ một cộng đồng tôn giáo hoặc ngôn ngữ; mọi phương án đều bảo đảm quyền tham dự và tham gia bình đẳng.',
          'service-contract': 'Bạn quản lý một dịch vụ nông thôn theo sự giao quyền được cấp bang phê duyệt, bao gồm các phương án cung cấp đã nêu. Khả năng tiếp cận bằng ngôn ngữ phù hợp và điều kiện được hưởng dịch vụ là yêu cầu cố định đối với mọi nhà cung cấp. Bạn không được đánh đổi các bảo đảm đó để lấy một hình thức rẻ hơn.',
          'community-history': 'Hội độc lập của bạn ở đô thị chịu trách nhiệm trước các thành viên với ngôn ngữ, thế hệ và lịch sử khác nhau. Thỏa thuận sử dụng địa điểm cho phép mọi chủ đề được đề xuất. Không giả định rằng bất kỳ nhóm thành viên nào chỉ có một tiếng nói chính trị duy nhất.',
          'public-records': 'Cơ quan của bạn có cùng một mức công khai thông tin tối thiểu theo luật hư cấu ở mọi phương án, cùng cơ chế xem xét lại độc lập. Cấp bang cho phép rõ ràng việc cung cấp thêm khả năng tiếp cận. Hỗ trợ ngôn ngữ bắt buộc đã được tính trong các giả định về nguồn lực của tình huống.',
          'regional-cooperation': 'Với vai trò người đứng đầu nội các quốc gia, bạn kiến nghị một gói phòng chống lũ đã được cho phép lên nghị viện. Các bang tham gia đã chấp nhận phương thức triển khai cho những huyện nông thôn bị ảnh hưởng. Cách phân bổ không cho bạn quyền gạt bỏ các trách nhiệm không liên quan của cấp bang.',
        },
      ),
    },
    mbala: {
      name: 'Cộng hòa Mbala',
      code: 'Rm',
      inspiration: 'Bối cảnh hư cấu lấy cảm hứng từ Cộng hòa Trung Phi',
      summary: 'Một nước cộng hòa theo thể chế tổng thống, nơi các cơ quan quốc gia, chính quyền địa phương và các tổ chức cộng đồng đang xây dựng lại dịch vụ công. Thủ đô có mạng lưới hành chính dày hơn nhiều huyện nông thôn, nơi điều kiện tiếp cận và an ninh khác nhau. Kiến thức địa phương và hợp tác dân sự là những thế mạnh, trong khi người dân bất đồng về phân bổ nguồn lực, phát triển, đời sống văn hóa và cách khôi phục niềm tin.',
      institutions: [
        { label: 'Chính quyền', text: 'Cơ quan hành pháp quốc gia làm việc cùng cơ quan lập pháp và chính quyền các địa bàn. Trách nhiệm chính thức và năng lực triển khai thực tế có thể khác nhau giữa các nơi; mỗi tình huống xác định quyền hạn và nguồn lực có sẵn.' },
        { label: 'Thẩm quyền địa phương', text: 'Lãnh đạo địa phương làm việc thông qua hội đồng và các cơ chế cho phép của cấp quốc gia. Với những tình huống được chọn, nguồn kinh phí và phương thức triển khai được xác định để mọi phương án đã nêu đều khả thi.' },
        { label: 'Tham gia và xem xét lại', text: 'Các tổ chức cộng đồng, diễn đàn địa phương và thủ tục chính thức tạo ra các kênh tham gia. Tình huống nêu rõ những cơ chế xem xét lại nào đang hoạt động; không giả định rằng bất kỳ cộng đồng nào có quan điểm chính trị đồng nhất.' },
        { label: 'Nguồn lực và sự khác biệt', text: 'Chuyên môn và sự hợp tác địa phương hỗ trợ khôi phục dịch vụ. Cơ sở hạ tầng, khoảng cách và điều kiện an ninh khác nhau; thủ đô cũng như các cộng đồng nông thôn không được định nghĩa chỉ bằng xung đột hoặc sự yếu kém của thể chế.' },
      ],
      scenarioNotes: notes(
        'Trong tình huống đô thị hư cấu này, sở hữu công đối với khu nhà kho đã được xác minh, và một sự cho phép có kinh phí bảo đảm khiến mọi gói được nêu đều khả thi. Vẫn áp dụng việc hội đồng phê duyệt và cấp quốc gia rà soát tài chính. Các giả định đã được xác minh về đất đai, kinh phí và triển khai giống hệt nhau ở cả hai phiên bản.',
        {
          'public-assembly': 'Khu dân cư đô thị được chọn có quy trình tham vấn và xem xét lại đang hoạt động đối với các quy định tụ họp ôn hòa đã nêu. Mỗi đề xuất đều được cho phép trong bài tập này. Điều kiện của khu dân cư đó không mô tả an ninh hoặc sự tham gia trên toàn nước cộng hòa.',
          'water-partnership': 'Huyện nông thôn được chọn có điều kiện tiếp cận đã được xác minh, một khoản tài trợ dành riêng và một đối tác ở nước ngoài đã được cho phép. Các kiểm tra về triển khai bảo đảm mọi cách phân bổ đã nêu đều khả thi. Bài tập nói về phân bổ khoản tài trợ đó, không phải các giả định về sự phụ thuộc vào viện trợ hoặc năng lực địa phương.',
          'community-festival': 'Một ban dân sự địa phương và hội đồng có quy trình ngân sách công đang hoạt động dành cho lễ hội này. Người dân có các mối quan tâm khác nhau về di sản và những hoạt động mới. Tình huống nói về việc cấp kinh phí văn hóa thông thường, không gán một truyền thống hoặc quan điểm duy nhất cho toàn nước cộng hòa.',
          'service-contract': 'Bạn làm việc tại một huyện nông thôn nơi khả năng tiếp cận để triển khai và năng lực nhà cung cấp đã được kiểm tra. Một sự cho phép bằng văn bản cho phép mọi hình thức cung cấp dịch vụ đã nêu trong phạm vi ngân sách có kinh phí bảo đảm. Các yêu cầu chung về điều kiện được hưởng dịch vụ và xem xét lại vẫn có thể được thực thi ở mỗi phương án.',
          'community-history': 'Hội độc lập của bạn ở đô thị có địa điểm an toàn, nhiệm vụ do thành viên giao được xác định rõ và quyền thực hiện từng chủ đề triển lãm. Các thành viên mang theo những trải nghiệm khác nhau về đời sống dân sự. Lựa chọn này không phải phép thử lòng trung thành đối với một cách kể lịch sử của quốc gia hoặc cộng đồng.',
          'public-records': 'Cơ quan được chọn có hệ thống hồ sơ và cơ chế xem xét lại đang hoạt động phục vụ bài tập. Một sự cho phép hành chính có kinh phí bảo đảm cho phép từng mức tiếp cận bổ sung đã nêu, vượt trên mức tối thiểu chung. Bạn không nên suy ra rằng mọi cơ quan đều có năng lực tương tự.',
          'regional-cooperation': 'Với vai trò người đứng đầu hành pháp quốc gia, bạn đề xuất một gói đầu tư phòng chống lũ đã được cho phép lên cơ quan lập pháp. Các đối tác triển khai đã xác minh khả năng tiếp cận các dự án nông thôn được chọn ở mọi phương án. Năng lực được xác định này không hàm ý điều kiện đồng đều trên toàn quốc gia.',
        },
      ),
    },
  },
};
