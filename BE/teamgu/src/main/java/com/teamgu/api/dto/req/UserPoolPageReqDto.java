package com.teamgu.api.dto.req;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

@Data
@ApiModel(description = "인력풀 검색 Request 모델")
public class UserPoolPageReqDto {
    @ApiModelProperty(name = "검색 하는 사람의 프로젝트 코드(동일한 프로젝트 내에서만 검색되게 함)", example = "")
    private int project;

    @ApiModelProperty(name = "검색 대상의 지역 코드")
    private List<Integer> region;

    @ApiModelProperty(name = "검색 대상의 포지션 코드")
    private List<Integer> position;

    @ApiModelProperty(name = "검색 대상의 트랙 코드")
    private List<Integer> track;

    @ApiModelProperty(name = "검색 대상의 스킬 코드")
    private List<Integer> skills;

    @ApiModelProperty(name = "검색 대상의 전공 여부")
    private short isMajor;

    @ApiModelProperty(name = "검색 대상의 이름")
    private String name;

    @ApiModelProperty(name = "정렬 방식", example = "asc")
    private String sort;

    @ApiModelProperty(name = "검색하는 사람의 학번", example = "0503050")
    private String studentNumber;

    @ApiModelProperty(name = "원하는 페이지 번호", example = "1")
    private int pageNum;

    @ApiModelProperty(name = "한 페이지에 들어갈 데이터 개수", example = "10")
    private int pageSize;
}
